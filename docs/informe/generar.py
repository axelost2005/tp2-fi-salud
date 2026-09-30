"""Genera el informe en PDF a partir de informe.html.

Uso: pip install playwright pypdf reportlab && python -m playwright install chromium
     python generar.py            (deja el PDF en esta carpeta)
Requiere además pdftotext (paquete poppler-utils) para ubicar los títulos en el índice.

1. Primera pasada: imprime con Chromium y busca en qué página quedó cada título.
2. Segunda pasada: completa los números de página del índice y vuelve a imprimir.
3. Agrega encabezado (logos UNCO y FAI) y pie (número de página) desde la página 2.
"""
import io, re, subprocess, sys
from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

BASE = Path(__file__).resolve().parent
HTML = BASE / 'informe.html'
SALIDA = Path(sys.argv[1]) if len(sys.argv) > 1 else BASE / 'TP2-Confluencia-Salud-informe.pdf'

# Texto que identifica dónde está cada entrada del índice
MARCAS = {
    's1': '1. Introducción', 's2': '2. Elección del framework y del CMS', 's21': '2.1 Criterios y método',
    's22': '2.2 Framework: Next.js', 's23': '2.3 CMS: Payload', 's24': '2.4 Cómo se combinan',
    's3': '3. Template y estilos', 's31': '3.1 Template elegido', 's32': '3.2 El template antes y después',
    's33': '3.3 Estilos adoptados', 's34': '3.4 Lista de modificaciones', 's4': '4. Módulos',
    's41': '4.1 Usuarios y roles (modificado)', 's42': '4.2 Cartilla de profesionales (nuevo)',
    's43': '4.3 Novedades de salud (modificado)', 's44': '4.4 Turnos online (nuevo)',
    's5': '5. Decisiones de implementación y diseño', 's6': '6. Organización del trabajo',
    's7': '7. Conclusiones', 's8': '8. Bibliografía',
    **{f'f{i}': f'Figura {i}:' for i in range(1, 11)},
    **{f'c{i}': f'Cuadro {i}:' for i in range(1, 11)},
}


def imprimir(html: str) -> bytes:
    tmp = BASE / '_render.html'
    tmp.write_text(html, encoding='utf-8')
    with sync_playwright() as p:
        b = p.chromium.launch()
        page = b.new_page()
        page.goto(tmp.as_uri(), wait_until='networkidle')
        page.wait_for_timeout(400)
        pdf = page.pdf(format='A4', print_background=True, prefer_css_page_size=True)
        b.close()
    return pdf


def textos_por_pagina(pdf: bytes) -> list[str]:
    tmp = BASE / '_tmp.pdf'
    tmp.write_bytes(pdf)
    n = len(PdfReader(str(tmp)).pages)
    paginas = []
    for i in range(1, n + 1):
        t = subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), '-layout', str(tmp), '-'],
                           capture_output=True, text=True).stdout
        paginas.append(re.sub(r'\s+', ' ', t))
    return paginas


def buscar_paginas(paginas: list[str]) -> dict[str, int]:
    res = {}
    for clave, marca in MARCAS.items():
        m = re.sub(r'\s+', ' ', marca)
        # Se saltea el índice (página 2), donde aparecen todos los títulos
        for i, texto in enumerate(paginas[2:], start=3):
            if m in texto:
                res[clave] = i
                break
        else:
            res[clave] = 0
            print('!! no encontrado:', clave, marca)
    return res


def completar(html: str, numeros: dict[str, int]) -> str:
    return re.sub(r'\{\{p:(\w+)\}\}', lambda m: str(numeros.get(m.group(1), '')), html)


def estampar(pdf: bytes) -> bytes:
    pdfmetrics.registerFont(TTFont('Atkinson', str(BASE / 'fuentes/Atkinson-Regular.ttf')))
    pdfmetrics.registerFont(TTFont('Atkinson-Bold', str(BASE / 'fuentes/Atkinson-Bold.ttf')))
    lector = PdfReader(io.BytesIO(pdf))
    total = len(lector.pages)
    ancho = float(lector.pages[0].mediabox.width)
    alto = float(lector.pages[0].mediabox.height)
    izq, der = 20 * mm, ancho - 20 * mm

    # Capa fija (logos, textos y líneas): se crea una vez y se reutiliza en todas las hojas
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(ancho, alto))
    y_logo = alto - 17 * mm
    c.drawImage(str(BASE / 'logos/unco-chico.png'), izq, y_logo, width=8.2 * mm, height=9.9 * mm, mask='auto')
    c.drawImage(str(BASE / 'logos/fai-chico.png'), der - 8.1 * mm, y_logo, width=8.1 * mm, height=9.9 * mm, mask='auto')
    c.setFillColorRGB(0.08, 0.16, 0.17)
    c.setFont('Atkinson-Bold', 8.6)
    c.drawCentredString(ancho / 2, alto - 11.2 * mm, 'Frameworks e Interoperabilidad · TP N.º 2: CMS y Frameworks Web')
    c.setFont('Atkinson', 7.6)
    c.setFillColorRGB(0.31, 0.4, 0.39)
    c.drawCentredString(ancho / 2, alto - 15 * mm, 'Departamento Ingeniería de Sistemas · Facultad de Informática · Universidad Nacional del Comahue')
    c.setStrokeColorRGB(0.84, 0.89, 0.87)
    c.setLineWidth(0.6)
    c.line(izq, alto - 19.5 * mm, der, alto - 19.5 * mm)
    c.line(izq, 14 * mm, der, 14 * mm)
    c.setFont('Atkinson', 8)
    c.drawString(izq, 9.5 * mm, 'Confluencia Salud · Ostrovsky, Sánchez')
    c.save()
    buf.seek(0)
    capa_fija = PdfReader(buf).pages[0]

    escritor = PdfWriter()
    for i, pagina in enumerate(lector.pages, start=1):
        if i > 1:
            pagina.merge_page(capa_fija)
            nb = io.BytesIO()
            cn = canvas.Canvas(nb, pagesize=(ancho, alto))
            cn.setFont('Atkinson', 8)
            cn.setFillColorRGB(0.31, 0.4, 0.39)
            cn.drawRightString(der, 9.5 * mm, f'Página {i} de {total}')
            cn.save()
            nb.seek(0)
            pagina.merge_page(PdfReader(nb).pages[0])
        escritor.add_page(pagina)
    escritor.add_metadata({
        '/Title': 'TP2 CMS y Frameworks Web: Confluencia Salud',
        '/Author': 'Axel Ostrovsky, Tomás Sánchez',
        '/Subject': 'Frameworks e Interoperabilidad, Facultad de Informática, UNCO',
    })
    for p in escritor.pages:
        p.compress_content_streams()
    out = io.BytesIO()
    escritor.write(out)
    return out.getvalue()


if __name__ == '__main__':
    fuente = HTML.read_text(encoding='utf-8')
    primera = imprimir(completar(fuente, {k: 88 for k in MARCAS}))
    numeros = buscar_paginas(textos_por_pagina(primera))
    segunda = imprimir(completar(fuente, numeros))
    final = estampar(segunda)
    SALIDA.write_bytes(final)
    n = len(PdfReader(io.BytesIO(final)).pages)
    print('páginas:', n, '| tamaño:', round(len(final) / 1024), 'KB')
    print(numeros)

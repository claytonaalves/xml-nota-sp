from bottle import response, request, template, static_file
from app import app
from utils import formatDate
from geraxml import xml_notas
import static_routes
import json
import time
from datetime import datetime
from connection import conn

@app.route('/')
def index():
    return static_file('index.html', root='views')

@app.route('/notas')
def notas():
    response.content_type = "application/json"

    dataInicial = formatDate(request.GET.get('dataInicial'))
    dataFinal = formatDate(request.GET.get('dataFinal'))

    qry = conn.cursor()

    qry.execute("""\
    SELECT DISTINCT
        nf.numero as numero_nota,
        dt_emissao as rps_data,
        nf.nome as tomador_nome,
        nf.valor_servicos as basecalculo
    FROM nf
    LEFT JOIN usuarios_unicos us on (nf.nome=us.nome AND nf.cpfcnpj=us.cpfcgc)
    WHERE dt_emissao BETWEEN %s AND %s
    LIMIT 25
    """, (dataInicial, dataFinal))

    #qry = []
    #for c in range(100):
    #    qry.append((time.time(), datetime.date(2013, 7, 1), 'clayton', 50.22), )

    notas = []
    for nota in qry:
        notas.append({"numero": nota[0], "emissao": str(nota[1]), "nome": nota[2].decode('latin1'), "valor": nota[3]})

    return json.dumps(notas)

@app.route('/notas.xml')
def teste():
    response.set_header('Content-Disposition', 'attachment; filename="notasfiscais.xml"')
    data1 = datetime.strptime(request.GET.get('dataInicial'), '%d/%m/%Y')
    data2 = datetime.strptime(request.GET.get('dataFinal'), '%d/%m/%Y')
    return xml_notas(data1, data2)


if __name__=="__main__":
    app.run(host='localhost', port=8080)

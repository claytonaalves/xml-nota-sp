import bottle
from bottle import response, request, template, static_file
import MySQLdb
import json
import datetime
import time

bottle.debug(True)

app = bottle.Bottle()

conn = MySQLdb.connect("localhost", "admmysql", "1234", "vigo")
qry = conn.cursor()

@app.route('/')
def index():
    return static_file('index.html', root='views')

@app.route('/notas')
def notas():
    response.content_type = "application/json"

    dataInicial = datetime.datetime.strptime(request.GET.get('dataInicial'), "%d/%m/%Y").strftime('%Y-%m-%d')
    dataFinal = datetime.datetime.strptime(request.GET.get('dataFinal'), "%d/%m/%Y").strftime('%Y-%m-%d')

    #print '--->', dataInicial, dataFinal

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
    #for c in range(500):
    #    qry.append((time.time(), datetime.date(2013, 7, 1), 'clayton', 50.22), )

    notas = []
    for nota in qry:
        notas.append({"numero": nota[0], "emissao": str(nota[1]), "nome": nota[2].decode('latin1'), "valor": nota[3]})

    return json.dumps(notas)

@app.route('/nota.xml')
def teste():
    response.set_header('Content-Disposition', 'attachment; filename="notasfiscais.xml"')
    #print request.GET.get('data')
    return "pequeno teste"

@app.route('/static/:path')
def static(path):
    return static_file(path, root='static/')

@app.route('/css/:path')
def css(path):
    return static_file(path, root='css/')

@app.route('/js/:path')
def js(path):
    return static_file(path, root='js/')

@app.route('/img/:path')
def js(path):
    return static_file(path, root='img/')


app.run(host='localhost', port=8080)

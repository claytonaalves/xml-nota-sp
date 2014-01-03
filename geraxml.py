#!/usr/bin/python -u
#coding: utf8
"""
This script is responsible for generating the NFe XML file.
"""
import os
import MySQLdb
import re
from lxml import etree
import sys

try:
    import json
except ImportError:
    import simplejson as json

mes    = sys.argv[1]
inicio = sys.argv[2]
fim    = sys.argv[3]
empresa = os.environ['NOME_EMPRESA'].decode('utf8')
servico = os.environ['NOME_SERVICO'].decode('utf8')

# Open config file
f = open('config.json', 'r')
config = json.load(f)
f.close()

conn = MySQLdb.connect("localhost", "admmysql", "1234", "vigo")
#conn = MySQLdb.connect("localhost", "root", "", "vigo")
qry = conn.cursor()
qry2 = conn.cursor()

# create view usuarios_unicos as select * from usuarios group by nome, cpfcgc order by situacao;
qry.execute(u"""\
SELECT DISTINCT
    nf.numero as numero_nota,
    dt_emissao as rps_data,
    nf.nome as tomador_nome,
    nf.cpfcnpj as tomador_cnpjcpf,
    IF(us.tipo='F', ' ', nf.rgie) as tomador_inscrmunicipal,
    IFNULL(us.endereco, '') as tomador_logradouro,
    IFNULL(us.referencia, '') as tomador_complemento,
    IFNULL(us.bairro, '') as tomador_bairro,
    nf.cep as tomador_cep,
    nf.cidade as tomador_municipio,
    nf.uf as tomador_uf,
    IFNULL(us.email, '') as tomador_email,
    nf.natureza as discriminacao,
    nf.valor_servicos as basecalculo,
    nf.valor_iss as issretido,
    nf.rgie
FROM nf
LEFT JOIN usuarios_unicos us on (nf.nome=us.nome AND nf.cpfcnpj=us.cpfcgc)
LEFT JOIN empresas emp on (us.idempresa=emp.id)
WHERE 
    (dt_emissao BETWEEN %s AND %s) AND
    (emp.fantasia=%s) AND
    (nf.natureza=%s)
ORDER BY nf.nome
""", (inicio, fim, empresa, servico))

root = etree.Element("importacao")

for nf in qry:
    print nf[0], nf[2].decode('latin1').encode('utf8')

    nota = etree.SubElement(root, "nota")

    node      = etree.SubElement(nota, "rps_numero")
    node.text = str(nf[0])

    node      = etree.SubElement(nota, "rps_data")
    node.text = str(nf[1])

    node      = etree.SubElement(nota, "tomador_nome")
    node.text = nf[2].decode('latin1')

    node      = etree.SubElement(nota, "tomador_cnpjcpf")
    node.text = nf[3].decode('latin1')

    node      = etree.SubElement(nota, "tomador_inscrmunicipal")
    node.text = nf[4].decode('latin1').strip()

    node = etree.SubElement(nota, "tomador_inscrestadual")
    node.text = nf[15].decode('latin1')

    logradouro = re.sub(',.+$', '', nf[5].decode('latin1'))
    numero = re.sub(u'.+,\s*[Nn]*[º°]*\s*', '', nf[5].decode('latin1'))
    numero = re.sub(u'[^\d]', '', nf[5].decode('latin1'))

    node = etree.SubElement(nota, "tomador_logradouro")
    node.text = logradouro

    node = etree.SubElement(nota, "tomador_numero")
    node.text = numero

    node = etree.SubElement(nota, "tomador_complemento")
    node.text = nf[6].decode('latin1')

    node = etree.SubElement(nota, "tomador_bairro")
    node.text = nf[7].decode('latin1')

    tomador_cep = etree.SubElement(nota, "tomador_cep")
    tomador_cep.text = nf[8].decode('latin1')

    tomador_municipio = etree.SubElement(nota, "tomador_municipio")
    tomador_municipio.text = nf[9].decode('latin1')

    tomador_uf = etree.SubElement(nota, "tomador_uf")
    tomador_uf.text = nf[10].decode('latin1')

    tomador_email = etree.SubElement(nota, "tomador_email")
    tomador_email.text = nf[11].decode('latin1')

    valortotal = etree.SubElement(nota, "valortotal")
    valortotal.text = '%.2f' % nf[13]

    deducoes = etree.SubElement(nota, "deducoes")
    deducoes.text = "%.2f" % config['deducoes']

    acrescimo = etree.SubElement(nota, "acrescimo")
    acrescimo.text = '0.00'

    basecalculo = etree.SubElement(nota, "basecalculo")
    basecalculo.text = '%.2f' % nf[13]

    aliqpercentual = etree.SubElement(nota, "aliqpercentual")
    aliqpercentual.text = '2.00'

    valoriss = etree.SubElement(nota, "valoriss")
    valoriss.text = '0.00'

    issretido = etree.SubElement(nota, "issretido")
    issretido.text = '0.00'

    cofins = etree.SubElement(nota, "cofins")
    cofins.text = '0.00'

    irrf = etree.SubElement(nota, "irrf")
    irrf.text = "%.2f" % config['irrf']

    contribuicaosocial = etree.SubElement(nota, "contribuicaosocial")
    contribuicaosocial.text = '0.00'

    pispasep = etree.SubElement(nota, "pispasep")
    pispasep.text = '0.00'

    inss = etree.SubElement(nota, "inss")
    inss.text = "%.2f" % config['inss']

    totalretencoes = etree.SubElement(nota, "totalretencoes")
    totalretencoes.text = '0.00'

    estado = etree.SubElement(nota, "estado")
    estado.text = config['estado']

    discriminacao = etree.SubElement(nota, "discriminacao")
    #discriminacao.appendChild(doc.createTextNode(nf[12].decode('latin1')))
    discriminacao.text = config['discriminacao']

    observacoes = etree.SubElement(nota, "observacoes")
    observacoes.text = config['observacoes']

    motivocancelamento = etree.SubElement(nota, "motivocancelamento")
    motivocancelamento.text = ''

    qry2.execute('select * from nf_servicos where numero=%s', nf[0])
    servicos = etree.SubElement(nota, "servicos")
    for nfs in qry2:
        servico = etree.SubElement(servicos, "servico")

        codigo = etree.SubElement(servico, "codigo")
        #codigo.text = '1.09'
        codigo.text = config['codigo']

        basecalculo = etree.SubElement(servico, "basecalculo")
        basecalculo.text = '%.2f' % nf[13]

        valoriss = etree.SubElement(servico, "valoriss")
        valoriss.text = '0.00'

        issretido = etree.SubElement(servico, "issretido")
        issretido.text = "%.2f" % nf[14]

        discriminacao = etree.SubElement(servico, "discriminacao")
        discriminacao.text = nfs[1].decode("latin1")

xml = etree.tostring(root, 
                     encoding='iso-8859-1',
                     xml_declaration=True,
                     pretty_print=True)

f = open('%s.xml' % mes,'wb')
f.write(xml)
f.close()

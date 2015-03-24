#!/usr/bin/python -u
#coding: utf8
"""
Gera um arquivo XML com notas fiscais para importação no provedor de SP.
"""

import os
import re
from lxml import etree
import sys
from dbVigo9 import notas_generator

try:
    import json
except ImportError:
    import simplejson as json

filename = sys.argv[1]

# lê as configurações salvas
f = open('config.json', 'r')
config = json.load(f)
f.close()

root = etree.Element("importacao")

for nf in notas_generator(os.getenv('TITULOS')):
    print nf[0], nf[2].encode("utf8")

    nota = etree.SubElement(root, "nota")

    node      = etree.SubElement(nota, "rps_numero")
    node.text = str(nf[0])

    node      = etree.SubElement(nota, "rps_data")
    node.text = str(nf[1])

    node      = etree.SubElement(nota, "tomador_nome")
    node.text = nf[2]

    node      = etree.SubElement(nota, "tomador_cnpjcpf")
    node.text = nf[3]

    node      = etree.SubElement(nota, "tomador_inscrmunicipal")
    node.text = nf[4].strip()

    node = etree.SubElement(nota, "tomador_inscrestadual")
    node.text = nf[15]

    logradouro = re.sub(',.+$', '', nf[5])
    numero = re.sub(u'.+,\s*[Nn]*[º°]*\s*', '', nf[5])
    numero = re.sub(u'[^\d]', '', nf[5])

    node = etree.SubElement(nota, "tomador_logradouro")
    node.text = logradouro

    node = etree.SubElement(nota, "tomador_numero")
    node.text = numero

    node = etree.SubElement(nota, "tomador_complemento")
    node.text = nf[6]

    node = etree.SubElement(nota, "tomador_bairro")
    node.text = nf[7]

    tomador_cep = etree.SubElement(nota, "tomador_cep")
    tomador_cep.text = nf[8]

    tomador_municipio = etree.SubElement(nota, "tomador_municipio")
    tomador_municipio.text = nf[9]

    tomador_uf = etree.SubElement(nota, "tomador_uf")
    tomador_uf.text = nf[10]

    tomador_email = etree.SubElement(nota, "tomador_email")
    tomador_email.text = nf[11]

    valortotal = etree.SubElement(nota, "valortotal")
    valortotal.text = '%.2f' % float(nf[13])

    deducoes = etree.SubElement(nota, "deducoes")
    deducoes.text = "%.2f" % config['deducoes']

    acrescimo = etree.SubElement(nota, "acrescimo")
    acrescimo.text = '0.00'

    basecalculo = etree.SubElement(nota, "basecalculo")
    basecalculo.text = '%.2f' % float(nf[13])

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
    discriminacao.text = config['discriminacao']

    observacoes = etree.SubElement(nota, "observacoes")
    observacoes.text = config['observacoes']

    motivocancelamento = etree.SubElement(nota, "motivocancelamento")
    motivocancelamento.text = ''

    servicos = etree.SubElement(nota, "servicos")
    servico = etree.SubElement(servicos, "servico")

    codigo = etree.SubElement(servico, "codigo")
    codigo.text = config['codigo']

    basecalculo = etree.SubElement(servico, "basecalculo")
    basecalculo.text = '%.2f' % float(nf[13])

    valoriss = etree.SubElement(servico, "valoriss")
    valoriss.text = '0.00'

    issretido = etree.SubElement(servico, "issretido")
    issretido.text = "%.2f" % nf[14]

    discriminacao = etree.SubElement(servico, "discriminacao")
    discriminacao.text = nf[12]

xml = etree.tostring(root, 
                     encoding='iso-8859-1',
                     xml_declaration=True,
                     pretty_print=True)

f = open(filename, 'w')
f.write(xml)
f.close()

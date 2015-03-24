#!/usr/bin/python -u
#coding: utf8
"""
Gera um arquivo XML com notas fiscais para importação no provedor de SP.
"""

import os
import re
import sys
from dbVigo9 import notas_generator
from NFSe_SP import XML, Nota, Servico
from config import config

filename = sys.argv[1]

xml = XML()

for nf in notas_generator(os.getenv('TITULOS')):
    rps = config.ultimo_rps + 1
    print rps, nf[1].encode("utf8")

    nota = Nota()

    nota.rps_numero             = str(rps)
    nota.rps_data               = str(nf[0])
    nota.tomador_nome           = nf[1]
    nota.tomador_cnpjcpf        = nf[2]
    nota.tomador_inscrmunicipal = nf[3].strip()
    nota.tomador_inscrestadual  = nf[14]

    logradouro = re.sub(',.+$', '', nf[4])
    numero = re.sub(u'.+,\s*[Nn]*[º°]*\s*', '', nf[4])
    numero = re.sub(u'[^\d]', '', nf[4])

    nota.tomador_logradouro  = logradouro
    nota.tomador_numero      = numero
    nota.tomador_complemento = nf[5]
    nota.tomador_bairro      = nf[6]
    nota.tomador_cep         = nf[7]
    nota.tomador_municipio   = nf[8]
    nota.tomador_uf          = nf[9]
    nota.tomador_email       = nf[10]
    nota.valortotal          = '%.2f' % float(nf[12])
    nota.deducoes            = config.deducoes
    nota.acrescimo           = '0.00'
    nota.basecalculo         = '%.2f' % float(nf[12])
    nota.aliqpercentual      = '2.00'
    nota.valoriss            = '0.00'
    nota.issretido           = '0.00'
    nota.cofins              = '0.00'
    nota.irrf                = config.irrf
    nota.contribuicaosocial  = '0.00'
    nota.pispasep            = '0.00'
    nota.inss                = config.inss
    nota.totalretencoes      = '0.00'
    nota.estado              = config.estado
    nota.discriminacao       = config.discriminacao
    nota.observacoes         = config.observacoes
    nota.motivocancelamento  = ''

    servico               = Servico()
    servico.codigo        = config.codigo
    servico.basecalculo   = '%.2f' % float(nf[12])
    servico.valoriss      = '0.00'
    servico.issretido     = "%.2f" % nf[13]
    servico.discriminacao = nf[11]

    nota.adiciona(servico)
    xml.adiciona(nota)

    config.ultimo_rps = rps

config.salva()

xml_file = open(filename, 'w')
xml_file.write(xml.tostring())
xml_file.close()

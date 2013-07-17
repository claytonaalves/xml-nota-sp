#coding: utf8
import MySQLdb
import re
from xml.dom.minidom import Document
import sys

mes    = sys.argv[1]
inicio = sys.argv[2]
fim    = sys.argv[3]

conn = MySQLdb.connect("localhost", "admmysql", "1234", "vigo")
qry = conn.cursor()
qry2 = conn.cursor()

doc = Document()

importacao = doc.createElement("importacao")
doc.appendChild(importacao)

# create view usuarios_unicos as select * from usuarios group by nome, cpfcgc order by situacao;
qry.execute("""\
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
WHERE dt_emissao BETWEEN %s AND %s
""", (inicio, fim))

for nf in qry:
    print nf[0], nf[2].decode('latin1')

    nota = doc.createElement("nota")

    rps_numero = doc.createElement("rps_numero")
    rps_numero.appendChild(doc.createTextNode(str(nf[0])))
    nota.appendChild(rps_numero)

    rps_data = doc.createElement("rps_data")
    rps_data.appendChild(doc.createTextNode(str(nf[1])))
    nota.appendChild(rps_data)

    tomador_nome = doc.createElement("tomador_nome")
    tomador_nome.appendChild(doc.createTextNode(nf[2].decode('latin1')))
    nota.appendChild(tomador_nome)

    tomador_cnpjcpf = doc.createElement("tomador_cnpjcpf")
    tomador_cnpjcpf.appendChild(doc.createTextNode(nf[3].decode('latin1')))
    nota.appendChild(tomador_cnpjcpf)

    tomador_inscrmunicipal = doc.createElement("tomador_inscrmunicipal")
    inscrmunicipal = nf[4].decode('latin1').strip()
    tomador_inscrmunicipal.appendChild(doc.createTextNode(inscrmunicipal))
    nota.appendChild(tomador_inscrmunicipal)

    tomador_inscrestadual = doc.createElement("tomador_inscrestadual")
    inscest = nf[15].decode('latin1')
    tomador_inscrestadual.appendChild(doc.createTextNode(inscest))
    nota.appendChild(tomador_inscrestadual)

    logradouro = re.sub(',.+$', '', nf[5].decode('latin1'))
    numero = re.sub(u'.+,\s*[Nn]*[º°]*\s*', '', nf[5].decode('latin1'))
    numero = re.sub(u'[^\d]', '', nf[5].decode('latin1'))

    tomador_logradouro = doc.createElement("tomador_logradouro")
    tomador_logradouro.appendChild(doc.createTextNode(logradouro))
    nota.appendChild(tomador_logradouro)

    tomador_numero = doc.createElement("tomador_numero")
    tomador_numero.appendChild(doc.createTextNode(numero))
    nota.appendChild(tomador_numero)

    tomador_complemento = doc.createElement("tomador_complemento")
    tomador_complemento.appendChild(doc.createTextNode(nf[6].decode('latin1')))
    nota.appendChild(tomador_complemento)

    tomador_bairro = doc.createElement("tomador_bairro")
    tomador_bairro.appendChild(doc.createTextNode(nf[7].decode('latin1')))
    nota.appendChild(tomador_bairro)

    tomador_cep = doc.createElement("tomador_cep")
    tomador_cep.appendChild(doc.createTextNode(nf[8].decode('latin1')))
    nota.appendChild(tomador_cep)

    tomador_municipio = doc.createElement("tomador_municipio")
    tomador_municipio.appendChild(doc.createTextNode(nf[9].decode('latin1')))
    nota.appendChild(tomador_municipio)

    tomador_uf = doc.createElement("tomador_uf")
    tomador_uf.appendChild(doc.createTextNode(nf[10].decode('latin1')))
    nota.appendChild(tomador_uf)

    tomador_email = doc.createElement("tomador_email")
    email = nf[11].decode('latin1')
    tomador_email.appendChild(doc.createTextNode(email))
    nota.appendChild(tomador_email)

    valortotal = doc.createElement("valortotal")
    valortotal.appendChild(doc.createTextNode('%.2f' % nf[13]))
    nota.appendChild(valortotal)

    deducoes = doc.createElement("deducoes")
    deducoes.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(deducoes)

    acrescimo = doc.createElement("acrescimo")
    acrescimo.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(acrescimo)

    basecalculo = doc.createElement("basecalculo")
    basecalculo.appendChild(doc.createTextNode('%.2f' % nf[13]))
    nota.appendChild(basecalculo)

    aliqpercentual = doc.createElement("aliqpercentual")
    aliqpercentual.appendChild(doc.createTextNode('2.00'))
    nota.appendChild(aliqpercentual)

    valoriss = doc.createElement("valoriss")
    valoriss.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(valoriss)

    issretido = doc.createElement("issretido")
    issretido.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(issretido)

    cofins = doc.createElement("cofins")
    cofins.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(cofins)

    irrf = doc.createElement("irrf")
    irrf.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(irrf)

    contribuicaosocial = doc.createElement("contribuicaosocial")
    contribuicaosocial.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(contribuicaosocial)

    pispasep = doc.createElement("pispasep")
    pispasep.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(pispasep)

    inss = doc.createElement("inss")
    inss.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(inss)

    totalretencoes = doc.createElement("totalretencoes")
    totalretencoes.appendChild(doc.createTextNode('0.00'))
    nota.appendChild(totalretencoes)

    estado = doc.createElement("estado")
    estado.appendChild(doc.createTextNode('N'))
    nota.appendChild(estado)

    discriminacao = doc.createElement("discriminacao")
    #discriminacao.appendChild(doc.createTextNode(nf[12].decode('latin1')))
    discriminacao.appendChild(doc.createTextNode('PROVEDOR DE ACESSO A INTERNET'))
    nota.appendChild(discriminacao)

    observacoes = doc.createElement("observacoes")
    observacoes.appendChild(doc.createTextNode(""))
    nota.appendChild(observacoes)

    motivocancelamento = doc.createElement("motivocancelamento")
    motivocancelamento.appendChild(doc.createTextNode(''))
    nota.appendChild(motivocancelamento)

    qry2.execute('select * from nf_servicos where numero=%s', nf[0])
    servicos = doc.createElement("servicos")
    for nfs in qry2:
        servico = doc.createElement("servico")

        codigo = doc.createElement("codigo")
        codigo.appendChild(doc.createTextNode('1.09'))
        servico.appendChild(codigo)

        basecalculo = doc.createElement("basecalculo")
        basecalculo.appendChild(doc.createTextNode('%.2f' % nf[13]))
        servico.appendChild(basecalculo)

        valoriss = doc.createElement("valoriss")
        valoriss.appendChild(doc.createTextNode('0.00'))
        servico.appendChild(valoriss)

        issretido = doc.createElement("issretido")
        issretido.appendChild(doc.createTextNode("%.2f" % nf[14]))
        servico.appendChild(issretido)

        discriminacao = doc.createElement("discriminacao")
        discriminacao.appendChild(doc.createTextNode(nfs[1].decode("latin1")))
        servico.appendChild(discriminacao)

        servicos.appendChild(servico)

    nota.appendChild(servicos)

    importacao.appendChild(nota)

#xml = doc.toprettyxml(
#        indent="    ", 
#        newl='\r\n',
#        )

xml = doc.toprettyxml(encoding='iso-8859-1')

f = open('%s.xml' % mes,'wb')
f.write(xml)
f.close()

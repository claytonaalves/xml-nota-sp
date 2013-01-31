#coding: utf8
import MySQLdb
import re
from xml.dom.minidom import Document

conn = MySQLdb.connect("localhost", "admmysql", "1234", "vigo")
qry = conn.cursor()
qry2 = conn.cursor()

doc = Document()

importacao = doc.createElement("importacao")
doc.appendChild(importacao)

qry.execute("""\
SELECT
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
    nf.valor_iss as issretido
FROM nf
LEFT JOIN usuarios us on (nf.nome=us.nome AND nf.cpfcnpj=us.cpfcgc)
WHERE dt_emissao BETWEEN '2013-01-01' AND '2013-01-31'
""")

for nf in qry:
    print nf[0]
    nota = doc.createElement("nota")

    rps_data = doc.createElement("rps_data")
    rps_data.appendChild(doc.createTextNode(str(nf[1])))
    nota.appendChild(rps_data)

    tomador_nome = doc.createElement("tomador_nome")
    tomador_nome.appendChild(doc.createTextNode(nf[2].decode('latin1')))
    nota.appendChild(tomador_nome)

    tomador_cpfcnpj = doc.createElement("tomador_cpfcnpj")
    tomador_cpfcnpj.appendChild(doc.createTextNode(nf[3].decode('latin1')))
    nota.appendChild(tomador_cpfcnpj)

    tomador_inscrmunicipal = doc.createElement("tomador_inscrmunicipal")
    tomador_inscrmunicipal.appendChild(doc.createTextNode(nf[4].decode('latin1')))
    nota.appendChild(tomador_inscrmunicipal)

    logradouro = re.sub(',.+$', '', nf[5].decode('latin1'))
    numero = re.sub(u'.+,\s*[Nn]*[º°]*\s*', '', nf[5].decode('latin1'))

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
    tomador_email.appendChild(doc.createTextNode(nf[11].decode('latin1')))
    nota.appendChild(tomador_email)

    discriminacao = doc.createElement("discriminacao")
    discriminacao.appendChild(doc.createTextNode(nf[12].decode('latin1')))
    nota.appendChild(discriminacao)

    observacao = doc.createElement("observacao")
    nota.appendChild(observacao)

    aliqinss = doc.createElement("aliqinss")
    nota.appendChild(aliqinss)

    aliqirrf = doc.createElement("aliqirrf")
    nota.appendChild(aliqirrf)

    deducaoirrf = doc.createElement("deducaoirrf")
    nota.appendChild(deducaoirrf)

    valordeducoes = doc.createElement("valordeducoes")
    nota.appendChild(valordeducoes)

    estado = doc.createElement("estado")
    estado.appendChild(doc.createTextNode('Normal'))
    nota.appendChild(estado)

    qry2.execute('select * from nf_servicos where numero=%s', nf[0])
    codservico = doc.createElement("codservico")
    for servico in qry2:
        cservico = doc.createElement("codservico")
        cservico.appendChild(doc.createTextNode('1.09'))
        codservico.appendChild(cservico)

        basecalculo = doc.createElement("basecalculo")
        basecalculo.appendChild(doc.createTextNode(str(nf[13])))
        codservico.appendChild(basecalculo)

        issretido = doc.createElement("issretido")
        issretido.appendChild(doc.createTextNode(str(nf[14])))
        codservico.appendChild(issretido)

        discriminacao = doc.createElement("discriminacao")
        discriminacao.appendChild(doc.createTextNode(servico[1].decode("latin1")))
        codservico.appendChild(discriminacao)

    nota.appendChild(codservico)

    importacao.appendChild(nota)

#xml = doc.toprettyxml(
#        indent="    ", 
#        newl='\r\n',
#        )

xml = doc.toprettyxml(encoding='iso-8859-1')

f = open('saida.xml','wb')
f.write(xml)
f.close()

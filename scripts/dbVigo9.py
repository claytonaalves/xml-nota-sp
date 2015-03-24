import MySQLdb
import csv
import datetime
conn = MySQLdb.connect('186.250.96.10', 'appnotas', 'poqw5674', 'vigo_erp', charset='latin1', use_unicode=True)
q = conn.cursor()

query = """select c.id, c.nome, c.cpfcgc, c.rgie, c.endereco, c.bairro,
c.cep, c.cidade, c.uf, c.email, c.tipo, b.vencimento, p.valor,
p.descricao
from cadastro_clientes c
left join financeiro_boletos b on (b.id_cliente=c.id)
left join financeiro_planos_clientes p on (c.id=p.idcliente)
where
   b.ativo='S'                                                                      
   and (p.aliquota='N' and p.usar='N')
   and (c.vendedor='16 - FERNANDA TRIANOSKI DE LIMA')                               
   and b.id in (%s)
order by nome"""

def notas_generator(lista_de_ids):
    q.execute(query % lista_de_ids)
    for dados_cliente in q:
        numero        = dados_cliente[0]
        nome          = dados_cliente[1]
        cnpjcpf       = dados_cliente[2]
        rgie          = dados_cliente[3]
        endereco      = dados_cliente[4]
        bairro        = dados_cliente[5]
        cep           = dados_cliente[6]
        cidade        = dados_cliente[7]
        uf            = dados_cliente[8]
        email         = dados_cliente[9]
        tipo          = dados_cliente[10]
        inscricao     = ' ' if tipo=='F' else dados_cliente[2]
        bc            = dados_cliente[12]
        discriminacao = dados_cliente[13]
        issretido     = 0.0
        vencimento    = dados_cliente[11].strftime('%Y-%m-%d')
        yield [vencimento, nome, cnpjcpf, inscricao, endereco, '', bairro, cep, cidade, uf, email, discriminacao, bc, issretido, rgie]


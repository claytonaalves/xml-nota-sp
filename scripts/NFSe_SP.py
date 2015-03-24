from lxml import etree

class XML:

    def __init__(self):
        self.root = etree.Element("importacao")

    def addSubElement(self, root, elemento, campo):
        node = etree.SubElement(root, campo)
        node.text = getattr(elemento, campo)

    def adiciona(self, nota):
        root = etree.SubElement(self.root, "nota")

        self.addSubElement(root, nota, "rps_numero")
        self.addSubElement(root, nota, "rps_data")
        self.addSubElement(root, nota, "tomador_nome")
        self.addSubElement(root, nota, "tomador_cnpjcpf")
        self.addSubElement(root, nota, "tomador_inscrmunicipal")
        self.addSubElement(root, nota, "tomador_inscrestadual")
        self.addSubElement(root, nota, "tomador_logradouro")
        self.addSubElement(root, nota, "tomador_numero")
        self.addSubElement(root, nota, "tomador_complemento")
        self.addSubElement(root, nota, "tomador_bairro")
        self.addSubElement(root, nota, "tomador_cep")
        self.addSubElement(root, nota, "tomador_municipio")
        self.addSubElement(root, nota, "tomador_uf")
        self.addSubElement(root, nota, "tomador_email")
        self.addSubElement(root, nota, "valortotal")
        self.addSubElement(root, nota, "deducoes")
        self.addSubElement(root, nota, "acrescimo")
        self.addSubElement(root, nota, "basecalculo")
        self.addSubElement(root, nota, "aliqpercentual")
        self.addSubElement(root, nota, "valoriss")
        self.addSubElement(root, nota, "issretido")
        self.addSubElement(root, nota, "cofins")
        self.addSubElement(root, nota, "irrf")
        self.addSubElement(root, nota, "contribuicaosocial")
        self.addSubElement(root, nota, "pispasep")
        self.addSubElement(root, nota, "inss")
        self.addSubElement(root, nota, "totalretencoes")
        self.addSubElement(root, nota, "estado")
        self.addSubElement(root, nota, "discriminacao")
        self.addSubElement(root, nota, "observacoes")
        self.addSubElement(root, nota, "motivocancelamento")

        servicos = etree.SubElement(root, "servicos")

        for servico in nota.servicos:
            root = etree.SubElement(servicos, "servico")

            self.addSubElement(root, servico, "codigo")
            self.addSubElement(root, servico, "basecalculo")
            self.addSubElement(root, servico, "valoriss")
            self.addSubElement(root, servico, "issretido")
            self.addSubElement(root, servico, "discriminacao")

    def tostring(self):
        return etree.tostring(self.root, 
                              encoding='iso-8859-1',
                              xml_declaration=True,
                              pretty_print=True) 


class Servico:
    pass


class Nota:

    def __init__(self):
        self.servicos = []

    def adiciona(self, servico):
        self.servicos.append(servico)

if __name__=="__main__":
    xml = XML()

    nota = Nota()

    nota.rps_numero             = '1234'
    nota.rps_data               = '11/09/1982'
    nota.tomador_nome           = 'Fulano da Silva'
    nota.tomador_cnpjcpf        = '976.710.021-00'
    nota.tomador_inscrmunicipal = '0'
    nota.tomador_inscrestadual  = '0'
    nota.tomador_logradouro     = '0'
    nota.tomador_numero         = '0'
    nota.tomador_complemento    = '0'
    nota.tomador_bairro         = '0'
    nota.tomador_cep            = '0'
    nota.tomador_municipio      = '0'
    nota.tomador_uf             = '0'
    nota.tomador_email          = '0'
    nota.valortotal             = '0'
    nota.deducoes               = '0'
    nota.acrescimo              = '0'
    nota.basecalculo            = '0'
    nota.aliqpercentual         = '0'
    nota.valoriss               = '0'
    nota.issretido              = '0'
    nota.cofins                 = '0'
    nota.irrf                   = '0'
    nota.contribuicaosocial     = '0'
    nota.pispasep               = '0'
    nota.inss                   = '0'
    nota.totalretencoes         = '0'
    nota.estado                 = '0'
    nota.discriminacao          = '0'
    nota.observacoes            = '0'
    nota.motivocancelamento     = '0'

    servico               = Servico()
    servico.codigo        = '1234'
    servico.basecalculo   = ''
    servico.valoriss      = ''
    servico.issretido     = ''
    servico.discriminacao = ''

    nota.adiciona(servico)

    xml.adiciona(nota)

    print xml.tostring()

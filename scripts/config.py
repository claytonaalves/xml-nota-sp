#coding: utf8
try:
    import json
except ImportError:
    import simplejson as json

class Config:

    filename = 'config.json'

    def __init__(self):
        # lê as configurações salvas
        f = open(self.filename, 'r')
        self.config = json.load(f)
        f.close()

        self.ultimo_rps    = int(self.config['ultimo_rps'])
        self.deducoes      = '%.2f' % self.config['deducoes']
        self.irrf          = '%.2f' % self.config['irrf']
        self.inss          = '%.2f' % self.config['inss']
        self.estado        = self.config['estado']
        self.discriminacao = self.config['discriminacao']
        self.observacoes   = self.config['observacoes']
        self.codigo        = self.config['codigo']

    def salva(self):
        self.config['ultimo_rps'] = str(self.ultimo_rps)

        f = open(self.filename, 'w')
        f.write(json.dumps(self.config))
        f.close()
        
config = Config()


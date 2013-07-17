function strzero(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function DiasNoMes(Mes, Ano) {
    return new Date(Ano, Mes, 0).getDate();
}

function DataValida(Data) {
    var data = new Date();
    var Ano1 = data.getFullYear();
    var Mes1 = data.getMonth()+1;
    var Dia1 = data.getDay();

    Data = Data.replace('/', '');

    try {
        var DiaX = parseInt(Data.substr(0, 2), 10) || 0;
        var MesX = parseInt(Data.substr(2, 2), 10) || 0;
        var AnoX = parseInt(Data.substr(4, 4), 10) || 0;
    }
    catch (error) {
        var DiaX = 0;
        var MesX = 0;
        var AnoX = 0;
    }

    // faixa valida 01/01/1900 ... 31/12/2199
    if (DiaX === 0) {
       DiaX = Dia1;
       MesX = Mes1;
       AnoX = Ano1;
     }

    if (MesX > 12) MesX = 12;
    if (MesX === 0) MesX = Mes1;
    if (AnoX === 0) AnoX = Ano1;

    if (DiaX > DiasNoMes(MesX, AnoX)) DiaX = DiasNoMes(MesX, AnoX);

    if (AnoX <= 79) {
        AnoX = 2000 + AnoX;
    } else {
        if ((AnoX >= 80) && (AnoX < 100)) {
            AnoX = 1900 + AnoX
        } else {
          if ((AnoX >= 0100) && (AnoX < 1900))
              AnoX = 1900
          else
              if (AnoX > 2199) AnoX = 2199;
        }
    }

   return strzero(DiaX, 2) + '/' + strzero(MesX, 2) + '/' + strzero(AnoX, 4);
}

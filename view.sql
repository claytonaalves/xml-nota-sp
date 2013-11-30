CREATE VIEW usuarios_unicos AS  
select * from usuarios 
group by usuarios.nome, usuarios.cpfcgc 
order by usuarios.situacao;

<?php

// Conexão com o banco de dados
$host = "devweb3sql.mysql.dbaas.com.br";
$user = "devweb3sql";
$password = "h2023_FaTEC#$";
$dbname = "devweb3sql";

// Cria a conexão
$conn = new mysqli($host, $user, $password, $dbname);

// Verifica a conexão
if ($conn->connect_error) {
    die("Falha na conexão: " . $conn->connect_error);
}

// Recebe os dados do formulário e sanitiza
$nome         = $conn->real_escape_string($_POST['nome']);
$cpf          = $conn->real_escape_string($_POST['cpf']);
$email        = $conn->real_escape_string($_POST['email']);
$telefone     = $conn->real_escape_string($_POST['telefone']);
$cep          = $conn->real_escape_string($_POST['cep']);
$logradouro   = $conn->real_escape_string($_POST['logradouro']);
$numero       = $conn->real_escape_string($_POST['numero']);
$complemento  = $conn->real_escape_string($_POST['complemento']);
$senha        = $_POST['senha'];
$confirmaSenha = $_POST['confirmaSenha'];

// Validação básica: conferir se as senhas conferem
if ($senha !== $confirmaSenha) {
    die("As senhas não conferem. <a href='cadastro.html'>Voltar</a>");
}

// Insere os dados na tabela (exemplo com tabela "clientes")
$sql = "INSERT INTO cliente (nome, cpf, email, telefone, cep, logradouro, numero, complemento, senha)
        VALUES ('$nome', '$cpf', '$email', '$telefone', '$cep', '$logradouro', '$numero_casa', '$complemento', '$senha')";

if ($conn->query($sql) === TRUE) {
    echo "Cadastro realizado com sucesso!";
} else {
    echo "Erro: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>

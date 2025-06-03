<?php
// api_auth_funcionario.php

// --- Configurações Iniciais e Headers ---
error_reporting(E_ALL);
// Para depuração, mantenha display_errors como 1. Para produção, mude para 0.
ini_set('display_errors', 1);
ini_set('log_errors', 1);
// Defina um caminho VÁLIDO e ESCREVÍVEL para o log de erros no seu servidor
// Exemplo: ini_set('error_log', __DIR__ . '/php_auth_funcionario_errors.log'); 
// Se __DIR__ não funcionar, use um caminho absoluto como:
// ini_set('error_log', '/home/storage/4/ed/e3/devweb3ok1/logs/php_auth_funcionario_errors.log'); (CRIE A PASTA 'logs')

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// --- Configuração do Banco de Dados ---
$host = 'wesley.mysql.dbaas.com.br';
$dbname = 'wesley';
$username_db = 'wesley';
$password_db = 'tI7u96pYDAv3I#';

$conn = new mysqli($host, $username_db, $password_db, $dbname);

if ($conn->connect_error) {
    http_response_code(503);
    error_log("FATAL: Erro de conexão MySQLi (api_auth_funcionario): Host: $host, Username: $username_db, DBName: $dbname, Erro: " . $conn->connect_error);
    echo json_encode(["success" => false, "message" => "Erro interno do servidor: não foi possível conectar ao serviço de dados."]);
    exit();
}

if (!$conn->set_charset("utf8mb4")) {
    error_log("Aviso: Erro ao definir o charset para utf8mb4 (api_auth_funcionario): " . $conn->error);
}

// --- Lógica da API ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = json_decode(file_get_contents('php://input'), true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        error_log("Erro ao decodificar JSON da requisição (api_auth_funcionario): " . json_last_error_msg());
        echo json_encode(["success" => false, "message" => "Formato de requisição inválido (JSON malformado)."]);
        $conn->close();
        exit;
    }

    $login_input = isset($inputData['login']) ? trim($inputData['login']) : null;
    $senha_input = isset($inputData['senha']) ? $inputData['senha'] : null;

    if (empty($login_input) || empty($senha_input)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Os campos login e senha são obrigatórios."]);
        $conn->close();
        exit;
    }

    $sql = "SELECT funcionario_id, nome, cargo, perfil, senha, nivel_admin FROM Funcionarios WHERE login = ?";
    $stmt = $conn->prepare($sql);

    if ($stmt === false) {
        http_response_code(500);
        error_log("Erro ao preparar consulta SQL (select Funcionario): " . $conn->error);
        echo json_encode(["success" => false, "message" => "Erro interno do servidor ao processar sua solicitação (DB Prepare). Detalhe: " . $conn->error]);
        $conn->close();
        exit;
    }

    if (!$stmt->bind_param("s", $login_input)) {
        http_response_code(500);
        error_log("Erro ao vincular parâmetros (select Funcionario): " . $stmt->error);
        echo json_encode(["success" => false, "message" => "Erro interno do servidor ao processar sua solicitação (DB Bind)."]);
        $stmt->close();
        $conn->close();
        exit;
    }

    if (!$stmt->execute()) {
        http_response_code(500);
        error_log("Erro ao executar consulta (select Funcionario): " . $stmt->error);
        echo json_encode(["success" => false, "message" => "Erro interno do servidor ao processar sua solicitação (DB Execute)."]);
        $stmt->close();
        $conn->close();
        exit;
    }

    // --- USO DE BIND_RESULT E FETCH (ALTERNATIVA A GET_RESULT) ---
    $stmt->store_result(); // Necessário para usar num_rows e para bind_result funcionar corretamente antes de fetch

    error_log("Query executada para login: " . $login_input . ". Linhas encontradas: " . $stmt->num_rows);

    if ($stmt->num_rows === 1) {
        // Vincular colunas do resultado a variáveis PHP
        // A ordem deve corresponder EXATAMENTE à ordem das colunas no seu SELECT
        $stmt->bind_result($funcionario_id_db, $nome_db, $cargo_db, $perfil_db, $senha_hash_db_bind, $nivel_admin_db);

        if ($stmt->fetch()) { // Buscar os dados para as variáveis vinculadas

            error_log("Hash da senha do DB para login '$login_input': " . $senha_hash_db_bind);
            // error_log("Senha fornecida pelo input para login '$login_input': " . $senha_input); // Cuidado ao logar senhas em claro

            if (password_verify($senha_input, $senha_hash_db_bind)) {
                http_response_code(200);

                // Iniciar sessão com dados importantes
                $_SESSION['funcionario_id'] = $funcionario_id_db;
                $_SESSION['nome'] = $nome_db;
                $_SESSION['cargo'] = $cargo_db;
                $_SESSION['perfil_id'] = $perfil_db;
                $_SESSION['nivel_admin'] = $nivel_admin_db;

                // Define tipo do usuário para uso no menu, por exemplo
                if ($nivel_admin_db == 1) {
                    $_SESSION['tipo_usuario'] = 'admin';
                } elseif ($nivel_admin_db == 2) {
                    $_SESSION['tipo_usuario'] = 'operacao';
                } elseif ($nivel_admin_db == 3) {
                    $_SESSION['tipo_usuario'] = 'visualizacao';
                } else {
                    $_SESSION['tipo_usuario'] = 'visualizacao'; // fallback
                }


                $userData = [
                    "id" => $funcionario_id_db,
                    "nome" => $nome_db,
                    "cargo" => $cargo_db,
                    "tipo_usuario" => $_SESSION['tipo_usuario'],
                    "perfil_id" => $perfil_db,
                ];

                $token = bin2hex(random_bytes(32));
                echo json_encode([
                    "success" => true,
                    "message" => "Login realizado com sucesso!",
                    "user" => $userData,
                    "token" => $token
                ]);
            } else {
                error_log("password_verify retornou FALSE para login '$login_input'");
                http_response_code(401);
                echo json_encode(["success" => false, "message" => "Login ou senha inválidos."]);
            }
        } else {
            // fetch() falhou, o que é inesperado se num_rows era 1
            http_response_code(500);
            error_log("Erro ao buscar dados (fetch) após execute bem-sucedido para login '$login_input': " . $stmt->error);
            echo json_encode(["success" => false, "message" => "Erro ao processar dados do usuário (Fetch)."]);
        }
    } else {
        // num_rows não é 1 (0 ou >1)
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Login ou senha inválidos."]);
    }

    if (is_object($stmt)) {
        $stmt->close();
    }

} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método não permitido. Use POST."]);
}

$conn->close();
?>
<?php
/**
 * @api {get} /api_get_pedidos_favoritos.php Listar pizzas favoritas de um cliente
 * @apiName GetFavoritos
 * @apiGroup Favoritos
 *
 * @apiParam {Number} cliente_id ID do cliente para buscar os favoritos (obrigatório)
 *
 * @apiSuccess {Object[]} favoritos Lista de pizzas favoritas do cliente
 * @apiSuccess {Number} favoritos.cliente_id ID do cliente
 * @apiSuccess {Number} favoritos.pizza_id ID da pizza favorita
 * @apiSuccess {String} favoritos.nome_pizza Nome da pizza favorita
 * @apiSuccess {Number} favoritos.preco Preço da pizza favorita
 *
 * @apiError {Object[]} favoritos Array vazio caso não haja favoritos ou em caso de erro
 *
 * @apiMethod GET
 */

// Configuração do banco de dados
$host = 'wesley.mysql.dbaas.com.br'; // Endereço do servidor do banco de dados
$dbname = 'wesley'; // Nome do banco de dados
$username = 'wesley'; // Nome de usuário do banco de dados
$password = 'tI7u96pYDAv3I#'; // Senha do banco de dados

// Conexão com o banco de dados usando mysqli
$conexao = mysqli_connect($host, $username, $password, $dbname);
if (!$conexao) {
    echo json_encode(array(
        'error' => true,
        'message' => 'Erro de conexão: ' . mysqli_connect_error()
    ));
    exit;
}

mysqli_set_charset($conexao, "utf8"); // Configurar o charset para UTF-8

// Verificando o método da requisição
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtendo o ID do cliente
    $cliente_id = isset($_GET['cliente_id']) ? intval($_GET['cliente_id']) : null;

    // Validando se o cliente_id foi fornecido
    if ($cliente_id) {
        // Montando a query SQL para selecionar os pedidos favoritos do cliente
        $query = "SELECT cliente_id, pizza_id, nome_pizza, preco FROM pedidos_favoritos WHERE cliente_id = ?";

        $stmt = mysqli_prepare($conexao, $query);

        if ($stmt) {
            // Associando o parâmetro
            mysqli_stmt_bind_param($stmt, "i", $cliente_id);

            // Executando a query
            mysqli_stmt_execute($stmt);

            // Associando as variáveis para os resultados
            mysqli_stmt_bind_result($stmt, $cliente_id_result, $pizza_id_result, $nome_pizza_result, $preco_result);

            $favoritos = array();

            // Buscando os resultados
            while (mysqli_stmt_fetch($stmt)) {
                $favoritos[] = array(
                    'cliente_id' => $cliente_id_result,
                    'pizza_id' => $pizza_id_result,
                    'nome_pizza' => $nome_pizza_result,
                    'preco' => $preco_result
                );
            }

            // Se encontrou favoritos, retorna apenas os dados
            if (!empty($favoritos)) {
                echo json_encode($favoritos);
            } else {
                echo json_encode(array()); // Retorna um array vazio caso não haja favoritos
            }

            // Fechando a declaração preparada
            mysqli_stmt_close($stmt);
        } else {
            echo json_encode(array());
        }
    } else {
        echo json_encode(array()); // Retorna array vazio caso não tenha 'cliente_id'
    }
} else {
    echo json_encode(array()); // Retorna array vazio para método inválido
}

// Fechando a conexão com o banco de dados
mysqli_close($conexao);
?>
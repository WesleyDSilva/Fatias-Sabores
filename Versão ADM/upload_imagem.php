<?php
// upload_imagem.php
header('Content-Type: application/json');

$diretorioUpload = __DIR__ . '/../img/';
$urlBase = 'https://devweb3.ok.etc.br/img/';

if (!file_exists($diretorioUpload)) {
    mkdir($diretorioUpload, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagem'])) {
    $arquivo = $_FILES['imagem'];

    if ($arquivo['error'] === UPLOAD_ERR_OK) {
        $nomeTemp = $arquivo['tmp_name'];
        $extensao = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
        $nomeFinal = uniqid('img_', true) . '.' . $extensao;
        $caminhoCompleto = $diretorioUpload . $nomeFinal;
        $caminhoParaBanco = $urlBase . $nomeFinal;

        if (move_uploaded_file($nomeTemp, $caminhoCompleto)) {
            echo json_encode(['success' => true, 'caminho' => $caminhoParaBanco]);
            exit;
        }
    }

    echo json_encode(['success' => false, 'message' => 'Erro ao mover o arquivo']);
} else {
    echo json_encode(['success' => false, 'message' => 'Nenhum arquivo recebido']);
}

<!-- menu-lateral.php -->
<?php
// 'admin', 'operacao', 'visualizacao'

$tipo = $_SESSION['tipo_usuario'] ?? 'visualizacao'; // default de segurança
// $tipo = $_SESSION['tipo_usuario'] ?? 'admin'; // descomente para debugar
// $tipo = $_SESSION['tipo_usuario'] ?? 'operacao'; // descomente para debugar

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
?>

<style>
  .submenu {
  display: none;
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.5rem;
}

.has-submenu.open > .submenu {
  display: block;
}

.submenu-toggle {
  cursor: pointer;
  font-weight: bold;
  user-select: none;
}

.submenu-toggle::after {
  content: " ▼";
  font-size: 0.7em;
}

.has-submenu.open > .submenu-toggle::after {
  content: " ▲";
}
</style>

<aside class="menu-lateral">
  <h3>MENU</h3>
  <form action="logout-sessao.php" method="post" style="display:inline;">
    <button type="submit">🔓 Sair</button>
  </form>
  <ul>
    <?php if ($tipo === 'admin'): ?>
      <li><a href="adminDash.php">Início</a></li>
      <li><a href="novo-colaborador.php">Colaboradores</a></li>
      
      <!-- Produtos com submenu -->
      <li class="has-submenu">
        <span class="submenu-toggle">Produtos</span>
        <ul class="submenu">
          <li><a href="editar-pizzas.php">Cadastrar novo produto</a></li>
          <li><a href="nova-categoria.php">Adicionar nova categoria</a></li>
          <li><a href="editar-produto.php">Editar produto</a></li>
          <li><a href="editar-categoria.php">Editar categoria</a></li>
        </ul>
      </li>

      <!-- <li><a href="pedidos.php">Pedidos</a></li> -->

    <?php elseif ($tipo === 'operacao'): ?>
      <li><a href="editar-pizzas.php">Produtos</a></li>      
      <li><a href="adminDash.php">Pedidos</a></li>

    <?php elseif ($tipo === 'visualizacao'): ?>
      <li><a href="adminDash.php">Pedidos</a></li>
      <li><a href="editar-pizzas.php">Produtos</a></li>
    <?php endif; ?>
  </ul>
</aside>

<script>
  document.querySelectorAll('.submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.parentElement.classList.toggle('open');
    });
  });
</script>


// Função flip do card para mobile
document.querySelectorAll('.flip-card').forEach(card => {
  let isFlipped = false;
  
  card.addEventListener('click', () => {
      if (window.innerWidth < 768) { // Só aplica em mobile
          isFlipped = !isFlipped;
          card.querySelector('.flip-card-inner').style.transform = 
              isFlipped ? 'rotateY(180deg)' : 'rotateY(0)';
      }
  });
});

// Função para atualizar o menu baseado no status de login
function atualizarMenuUsuario() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const menuLogin = document.getElementById('menu-login');
  const menuCadastro = document.getElementById('menu-cadastro');
  const menuADM = document.getElementById('menu-adm');
  const menuFAV = document.getElementById('menu-fav');

  if (usuario) {
      // Atualiza o item de login
      if (menuLogin) {
          menuLogin.innerHTML = `
              <a href="perfil.html" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color: #FFA831;">
              <img src="/img/usuario.png" style="width: 24px; height: 24px;"> ${usuario.nome}</a>
          `;
      }

      // Atualiza o item de cadastro para histórico
      if (menuCadastro) {
          menuCadastro.innerHTML = `
              <a class="nav-link" href="histpedido.html">Histórico</a>
          `;
      }

      // Remove o link de administração se existir
      if (menuADM) {
          menuADM.innerHTML = `
              <button onclick="deslogarUsuario()" id="btn-logoff" class="btn me-2" style="border-radius: 30px; color: #FFFF; background-color:rgb(252, 44, 29);"> 
              <img src="/img/logout.png" style="width: 24px; height: 24px;">Sair</button>
          `;
      }

      // Adiciona o link de favoritos
      if (menuFAV) {
        menuFAV.innerHTML = `
            <a class="nav-link" href="favoritos.html">Favoritos</a>
        `;
    }

  }
}

// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  atualizarMenuUsuario();
});

//Função para deslogar o usuário e retornar o menu ao estado original
function deslogarUsuario() {
  // Remove o usuário do localStorage
  localStorage.removeItem('usuario');
  // Redireciona para a página inicial, ou recarrega a página para aplicar as mudanças
  window.location.href = 'index.html';
}

//função revelar senha nos campos de password
function toggleSenha(campoId) {
  var input = document.getElementById(campoId);
  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}


function toggleSenha(campoId) {
    var input = document.getElementById(campoId);
    if (input.type === "password") {
      input.type = "text";
    } else {
      input.type = "password";
    }
  }


    // Função para tratar os botões de incremento e decremento
    document.addEventListener("DOMContentLoaded", function() {
      const btnMinus = document.querySelectorAll('.btn-minus');
      const btnPlus = document.querySelectorAll('.btn-plus');

      btnMinus.forEach(function(button) {
        button.addEventListener('click', function() {
          const quantitySpan = this.parentElement.querySelector('.quantity');
          let current = parseInt(quantitySpan.textContent);
          if (current > 0) {
            quantitySpan.textContent = current - 1;
          }
        });
      });

      btnPlus.forEach(function(button) {
        button.addEventListener('click', function() {
          const quantitySpan = this.parentElement.querySelector('.quantity');
          let current = parseInt(quantitySpan.textContent);
          quantitySpan.textContent = current + 1;
        });
      });
    });
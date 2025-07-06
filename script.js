document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contadorCarrito = document.getElementById('contador-carrito');
    const itemsCarrito = document.querySelector('.items-carrito');
    const totalElement = document.getElementById('total');
    const btnComprar = document.querySelector('.btn-comprar');
    const linkCarrito = document.getElementById('link-carrito');
    const seccionCarrito = document.getElementById('carrito');
    const productosContainer = document.querySelector('.productos-container');

    // Cargar productos desde JSON 
    fetch('productos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar los productos');
            }
            return response.json();
        })
        .then(productos => {
            renderizarProductos(productos);
        })
        .catch(error => {
            console.error('Error al cargar productos:', error);
            productosContainer.innerHTML = '<p class="error">No se pudieron cargar los productos. Por favor intenta más tarde.</p>';
        });

    // productos en el DOM
    function renderizarProductos(productos) {
        productosContainer.innerHTML = '';
        
        productos.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <span class="precio">$${producto.precio.toFixed(2)}</span>
                <button class="btn agregar-carrito" 
                        data-id="${producto.id}" 
                        data-nombre="${producto.nombre}" 
                        data-precio="${producto.precio}">
                    Agregar al carrito
                </button>
            `;
            productosContainer.appendChild(card);
        });

      
        agregarEventosCarrito();
    }

    
    function agregarEventosCarrito() {
        document.querySelectorAll('.agregar-carrito').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                const nombre = this.getAttribute('data-nombre');
                const precio = parseFloat(this.getAttribute('data-precio'));
                
                const itemExistente = carrito.find(item => item.id === id);
                
                if (itemExistente) {
                    itemExistente.cantidad++;
                } else {
                    carrito.push({
                        id,
                        nombre,
                        precio,
                        cantidad: 1
                    });
                }
                
                guardarCarrito();
                mostrarNotificacion(`${nombre} agregado al carrito`);
            });
        });
    }

    // Actualizar contador 
    function actualizarContador() {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        contadorCarrito.textContent = totalItems;
        contadorCarrito.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    // Actualizar vista 
    function actualizarCarrito() {
        itemsCarrito.innerHTML = '';
        
        if (carrito.length === 0) {
            itemsCarrito.innerHTML = '<p>Tu carrito está vacío</p>';
            totalElement.textContent = '0.00';
            return;
        }

        let total = 0;
        
        carrito.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-carrito';
            itemElement.innerHTML = `
                <h4>${item.nombre}</h4>
                <div class="controles-cantidad">
                    <button class="btn disminuir" data-id="${item.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn aumentar" data-id="${item.id}">+</button>
                </div>
                <span class="precio">$${(item.precio * item.cantidad).toFixed(2)}</span>
                <button class="btn eliminar" data-id="${item.id}">Eliminar</button>
            `;
            itemsCarrito.appendChild(itemElement);
            
            total += item.precio * item.cantidad;
        });

        totalElement.textContent = total.toFixed(2);
        
        // Agregar eventos
        document.querySelectorAll('.disminuir').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                modificarCantidad(id, -1);
            });
        });
        
        document.querySelectorAll('.aumentar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                modificarCantidad(id, 1);
            });
        });
        
        document.querySelectorAll('.eliminar').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                eliminarItem(id);
            });
        });
    }

    // Modificar cantidad de un item
    function modificarCantidad(id, cambio) {
        const item = carrito.find(item => item.id === id);
        
        if (item) {
            item.cantidad += cambio;
            
            if (item.cantidad <= 0) {
                carrito.splice(carrito.indexOf(item), 1);
            }
            
            guardarCarrito();
        }
    }

    // Eliminar item del carrito
    function eliminarItem(id) {
        const index = carrito.findIndex(item => item.id === id);
        
        if (index !== -1) {
            carrito.splice(index, 1);
            guardarCarrito();
        }
    }

    // Guardar carrito en localStorage
    function guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(carrito));
        actualizarContador();
        actualizarCarrito();
    }

    // Finalizar compra
    btnComprar.addEventListener('click', function() {
        if (carrito.length > 0) {
            mostrarNotificacion(`Compra finalizada por $${totalElement.textContent}. ¡Gracias!`);
            carrito.length = 0;
            guardarCarrito();
        }
    });

    // Mostrar/ocultar carrito
    linkCarrito.addEventListener('click', function(e) {
        e.preventDefault();
        seccionCarrito.classList.toggle('mostrar');
    });

    
    function mostrarNotificacion(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('mostrar');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }

    
    actualizarContador();
    actualizarCarrito();
});
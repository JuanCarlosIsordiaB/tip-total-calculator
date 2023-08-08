let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebida',
    3: 'Postre'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;


    //Revisar si hay campos vacios
    const camposVacios = [ mesa, hora].some( campo => campo === '');

    if(camposVacios){

        //Verificar si ya hay una alerta
        const existeAlerta = document.querySelector('.invalid-feedback');

        if(!existeAlerta){
            const alerta = document.createElement('div');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios.';
            document.querySelector('.modal-body form').appendChild(alerta);

            setTimeout(() => {
                alerta.remove();
            }, 3000);
        }
        return; 
    }

    //Asignar datos del formulario al cliente
    cliente = {...cliente, mesa , hora}
    

    //Ocultar modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();


    //Mostrar ls secciones
    mostrarSecciones();

    //Obtener platillos de la API de JSON server
    obtenerPlatillos();
}


function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => {
        seccion.classList.remove('d-none');
    });
}

function obtenerPlatillos(){
    const url= 'http://localhost:3000/platillos';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => mostrarPlatillos(resultado))
        .catch(error => console.log(error))
        
}

function mostrarPlatillos(platillos) {
    const contenido = document.querySelector('#platillos .contenido');
    
    platillos.forEach(platillo => {
        const row = document.createElement('DIV');
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('DIV');
        // Usa col-md-4 para pantallas medianas y más grandes, col-12 para pantallas pequeñas
        nombre.classList.add('col-md-4', 'col-12');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('DIV');
        // Usa col-md-3 para pantallas medianas y más grandes, col-6 para pantallas pequeñas
        precio.classList.add('col-md-3', 'col-6', 'fw-bold');
        precio.textContent = `$${platillo.precio}`;

        const categoria = document.createElement('DIV');
        // Usa col-md-3 para pantallas medianas y más grandes, col-6 para pantallas pequeñas
        categoria.classList.add('col-md-3', 'col-6', 'fw-bold');
        categoria.textContent = categorias[platillo.categoria] ;

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control');

        //Funcion que detecta la cantidad y el platillo que se esta agregando
        inputCantidad.onchange = function() {
            const cantidad = parseInt(inputCantidad.value);
            agregarPlatillo({...platillo, cantidad});
        }
        
        const agregar = document.createElement('DIV');
        // Usa col-md-2 para pantallas medianas y más grandes, col-12 para pantallas pequeñas
        agregar.classList.add('col-md-2', 'col-12');
        agregar.appendChild(inputCantidad);

        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    });
}

function agregarPlatillo(producto){
    //Extraer el pedido actual
    let { pedido } = cliente;
    

    //Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0){


        //Comprube si el elemento ya existe en el array
        if(pedido.some( articulo => articulo.id === producto.id)){
            //El articulo ya existe, Actualizar la cantidad
            const pedidoActualizado = pedido.map(articulo => {
                if(articulo.id == producto.id){
                    articulo.cantidad = producto.cantidad;
                }
                return articulo;
            });
            //Se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        }else{
            //El articulo no existe, lo agrega al arreglo
            cliente.pedido = [ ...pedido, producto];
        }
        
    }else{
        //Eliminar elementos cuando la cantidad es 0
        const resultado = pedido.filter( articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }
    //Limpiar el HTML previo
    limpiarHTML();

    if(cliente.pedido.length){
        //Mostrar el resumen
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }

    
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-5','px-3','shadow');

    //Información de la mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //Información de la hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Agregar a los elementos padres
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array de pedidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach( articulo => {
        const { nombre, cantidad, precio, id} = articulo;

        const lista = document.createElement('LI');
        lista.classList.add('list-group-item');

        //Nombre del articulo
        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        //Cantidad del articulo
        const cantidadEl = document.createElement('p');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //Precio del articulo
        const precioEl = document.createElement('p');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`;

        //Subtotal
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        //Boton para eliminar
        const eliminarBtn = document.createElement('button');
        eliminarBtn.classList.add('btn', 'btn-danger');
        eliminarBtn.textContent = 'Eliminar del Pedido';

        //Funcion para eliminar el pedido
        eliminarBtn.onclick = function(){
            eliminarProducto(id);
        }

        //Agregar Valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        //Agreagr Elemento al LI
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(eliminarBtn);

        //Agregar lista al grupo principal
        grupo.appendChild(lista);

    });

    //Agreagr al contenido
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //Mostrar formlario de propinas
    formularioPropinas();
}


function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');


    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad){
    return `$ ${precio * cantidad}`;
}

function eliminarProducto(id){
    const {pedido} = cliente;
    const resultado = pedido.filter( articulo => articulo.id !== id);
    cliente.pedido = [...resultado];

    //Limpiar el HTML previo
    limpiarHTML();

    if(cliente.pedido.length){
        //Mostrar el resumen
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }

    //El producto se elimino, regresamos la cantidad a 0 en el formulario
    const productoEliminado = `#producto-${id}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('p');
    texto.classList.add('text-center');
    texto.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(texto);
}


function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('DIV');
    formulario.classList.add('col-md-6', 'formulario', 'card','py-2','px-3', 'shadow');

    const divF = document.createElement('DIV');
    divF.classList.add('card','py-2','px-3', 'shadow');

    const heading = document.createElement('H3');
    heading.classList.add('my-4','text-center');
    heading.textContent = 'Propina';

    //Radio Button 10%
    const radio10 = document.createElement('INPUT');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //Radio Button 25%
    const radio25 = document.createElement('INPUT');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('LABEL');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('DIV');
    radio25Div.classList.add('form-check');

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    //Radio Button 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    //Agregar al div principal
    divF.appendChild(heading);
    divF.appendChild(radio10Div);
    divF.appendChild(radio25Div);
    divF.appendChild(radio50Div);

    //Agregarlo al formulario
    formulario.appendChild(divF);

    contenido.appendChild(formulario);
}


function calcularPropina(){
    const { pedido } = cliente;
    let subtotal = 0;

    //Calcular el subtotal a pagar
    pedido.forEach( articulo => {
        subtotal += articulo.cantidad * articulo.precio;
    });

    //Seleccionar el Radio Button con la propina del cliente
    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;

    //Calcular la propina
    const propina = ((subtotal * parseInt(propinaSeleccionada)) / 100);

    //Calcular el total a pagar
   const total = subtotal + propina;

   mostrarTotal(subtotal, total, propina);
    
}

function mostrarTotal(subtotal, total, propina){

    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar');

    //Subtotal
    const subt = document.createElement('p');
    subt.classList.add('fs-3', 'fw-bold', 'mt-5');
    subt.textContent = `Subtotal consumo: `;

    const subtSpan = document.createElement('SPAN');
    subtSpan.classList.add('fw-normal');
    subtSpan.textContent = `$${subtotal} `;

    subt.appendChild(subtSpan);

    //Propina
    const prop = document.createElement('p');
    prop.classList.add('fs-3', 'fw-bold', 'mt-5');
    prop.textContent = `Propina: `;

    const propSpan = document.createElement('SPAN');
    propSpan.classList.add('fw-normal');
    propSpan.textContent = `$${propina} `;

    prop.appendChild(propSpan);

    //Total
    const totalP = document.createElement('p');
    totalP.classList.add('fs-3', 'fw-bold', 'mt-5');
    totalP.textContent = `Total: `;

    const totalSpan = document.createElement('SPAN');
    totalSpan.classList.add('fw-normal');
    totalSpan.textContent = `$${total} `;


    totalP.appendChild(totalSpan);

    //Eliminar el ultimo resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }

    //Todas las variables
    divTotales.appendChild(subt);
    divTotales.appendChild(prop);
    divTotales.appendChild(totalP);

    const formulario = document.querySelector('.formulario > div');
    formulario.appendChild(divTotales);


}

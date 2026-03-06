/* --- CONFIGURACIÓN E IMÁGENES --- */
const IMG_PRINCIPAL = "./Images/Neuvillete Iocn.webp"; 
const IMG_EXITO = "./Images/Good Kaveh.webp"; 
const IMG_FALLO = "./Images/Exercise Wrong.webp"; 

// Motor de validación reutilizado y optimizado
async function pedirDato(titulo, config = {}) {
    const { negativo = true, decimal = false, soloLetra = false } = config;
    let valido = false;
    let respuesta;

    while (!valido) {
        const { value: res } = await Swal.fire({
            title: `Hola, ${titulo}`,
            imageUrl: IMG_PRINCIPAL,
            imageWidth: 90,
            input: 'text',
            inputPlaceholder: soloLetra ? "Escribe..." : "Solo números...",
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            customClass: { popup: 'bot-popup animate__animated animate__fadeInDown' }
        });

        if (res === undefined) return null;
        respuesta = res.trim();

        if (soloLetra) {
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(respuesta)) {
                await Swal.fire({ title: "Inválido", text: "Prohibido números o símbolos.", icon: "warning" });
                continue;
            }
        } else {
            const patron = decimal ? /^-?\d+(\.\d+)?$/ : /^-?\d+$/;
            if (!patron.test(respuesta)) {
                await Swal.fire({ title: "Formato Incorrecto", text: "No uses símbolos ni letras.", icon: "warning" });
                continue;
            }
            if (!negativo && Number(respuesta) < 0) {
                await Swal.fire({ title: "Error", text: "No se permiten negativos.", icon: "error" });
                continue;
            }
        }
        valido = true;
    }
    return respuesta;
}

function botRespuesta(mensaje) {
    Swal.fire({
        title: "¡Resultado listo!",
        html: mensaje,
        imageUrl: IMG_EXITO,
        imageWidth: 90,
        confirmButtonText: 'Entendido',
        customClass: { popup: 'bot-popup animate__animated animate__zoomIn' }
    });
}

/* ============================================================
   SOLUCIÓN RETO 1 (MÉTODOS ES6+)
   ============================================================ */

// 1. Suma de dos números
const reto1_ej1 = async () => {
    let a = await pedirDato("Primer número:", { decimal: true });
    let b = await pedirDato("Segundo número:", { decimal: true });
    if (!a || !b) return;

    const suma = (n1, n2) => Number(n1) + Number(n2); // Arrow function
    botRespuesta(`La suma de ${a} + ${b} es: <b>${suma(a, b)}</b><br><br><i>Explicación:</i> Se combinaron ambos valores en una operación aritmética simple.`);
};

// 2. Potencia de un número
const reto1_ej2 = async () => {
    let base = await pedirDato("Base:");
    let exponente = await pedirDato("Potencia:");
    if (!base || !exponente) return;

    const potencia = (b, e) => Math.pow(b, e);
    botRespuesta(`El resultado es: <b>${potencia(base, exponente)}</b><br><br><i>Explicación:</i> Se multiplicó la base por sí misma según el exponente dado.`);
};

// 3. Suma de cubos (Utiliza Spread Operator y Reduce - ES6+)
const reto1_ej3 = async () => {
    let inputs = [];
    for(let i=1; i<=3; i++) {
        let val = await pedirDato(`Número ${i} para elevar al cubo:`);
        if (val) inputs.push(Number(val));
    }
    
    // ES6+: Utiliza reduce para acumular los cubos
    const sumOfCubes = (...nums) => nums.reduce((acc, n) => acc + Math.pow(n, 3), 0);
    
    botRespuesta(`Suma de sus cubos: <b>${sumOfCubes(...inputs)}</b><br><br><i>Explicación:</i> Cada número se elevó al cubo (n³) y luego se sumaron los resultados.`);
};

// 4. Área de un Triángulo (Sin negativos)
const reto1_ej4 = async () => {
    let b = await pedirDato("Base del triángulo:", { negativo: false, decimal: true });
    let h = await pedirDato("Altura del triángulo:", { negativo: false, decimal: true });
    if (!b || !h) return;

    const triArea = (base, altura) => (base * altura) / 2;
    botRespuesta(`Área del triángulo: <b>${triArea(b, h)}</b><br><br><i>Explicación:</i> Se aplicó la fórmula geométrica (Base × Altura) / 2.`);
};

// 5. Calculator (ES6 Switch)
const reto1_ej5 = async () => {
    let n1 = await pedirDato("Primer número:", { decimal: true });
    const { value: op } = await Swal.fire({
        title: 'Operación',
        input: 'select',
        inputOptions: { '+': 'Suma (+)', '-': 'Resta (-)', '*': 'Multiplicación (x)', '/': 'División (/)', '%': 'Módulo (%)' }
    });
    let n2 = await pedirDato("Segundo número:", { decimal: true });
    
    const calculator = (v1, oper, v2) => {
        const a = Number(v1), b = Number(v2);
        switch(oper) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/': return b !== 0 ? a / b : "División por 0 inválida";
            case '%': return a % b;
            default: return "El parámetro no es reconocido";
        }
    };

    botRespuesta(`Resultado: <b>${calculator(n1, op, n2)}</b><br><br><i>Explicación:</i> Se ejecutó la operación seleccionada sobre los dos operandos.`);
};

/* PREGUNTAS TEÓRICAS */
const teoria_1 = () => botRespuesta("<b>¿Cómo defines una función?</b><br>Es un bloque de código reutilizable. En ES6 usamos <i>Arrow Functions</i>: <br><code>const miFuncion = () => { ... }</code>");

const teoria_2 = () => botRespuesta("<b>¿Hasta cuántos argumentos declarar?</b><br>No hay un límite técnico estricto, pero las buenas prácticas sugieren no exceder de 3 o 4 para mantener el código limpio.");


/* ============================================================
   INTEGRACIÓN RETO 2 (MATERIAL ADICIONAL)
   ============================================================ */

// Saludo concatenado con Arrow Function
const reto2_ej1 = async () => {
    let nombre = await pedirDato("Nombre:", { soloLetra: true });
    let apellido = await pedirDato("Apellido:", { soloLetra: true });
    let edad = await pedirDato("Edad:", { negativo: false });
    if (!nombre || !apellido || !edad) return;

    // Algoritmo ES6+ 
    const saludo = (n, a, e) => `Hola mi nombre es ${n} ${a} y mi edad ${e}`;
    
    botRespuesta(`<b>Frase generada:</b><br>"${saludo(nombre, apellido, edad)}"`);
};

// Suma con parámetros REST
const reto2_ej2 = async () => {
    let n1 = await pedirDato("Primer número:");
    let n2 = await pedirDato("Segundo número:");
    let n3 = await pedirDato("Tercer número:");
    if (!n1 || !n2 || !n3) return;

    // Algoritmo con REST 
    const sumarTodo = (...args) => args.reduce((acc, curr) => acc + Number(curr), 0);
    
    botRespuesta(`La suma de los ${[n1, n2, n3].length} argumentos es: <b>${sumarTodo(n1, n2, n3)}</b>`);
};

// Mínimos y Máximos de una matriz
const reto2_ej3 = async () => {
    let a = await pedirDato("Valor A:");
    let b = await pedirDato("Valor B:");
    let c = await pedirDato("Valor C:");
    if (!a || !b || !c) return;

    // Algoritmo minMax [cite: 8, 9]
    const obtenerMinMax = (matriz) => [Math.min(...matriz), Math.max(...matriz)];
    const res = obtenerMinMax([Number(a), Number(b), Number(c)]);

    botRespuesta(`En la serie [${a}, ${b}, ${c}]:<br>• Mínimo: <b>${res[0]}</b><br>• Máximo: <b>${res[1]}</b>`);
};

// Buscando a Nemo
const reto2_ej5 = async () => {
    const { value: texto } = await Swal.fire({
        title: "Encuentra a Nemo",
        input: 'text',
        inputPlaceholder: "Escribe: I am finding Nemo !",
        confirmButtonColor: '#4f46e5'
    });
    if (!texto) return;

    // Algoritmo Nemo [cite: 59, 60]
    const findNemo = (frase) => {
        const palabras = frase.split(" ");
        const pos = palabras.findIndex(p => p.toLowerCase() === "nemo") + 1;
        return pos > 0 ? `¡Encontré a Nemo en ${pos}!` : "Nemo no aparece...";
    };

    botRespuesta(findNemo(texto));
};

// Suma de cuadrados hasta n
const reto2_ej6 = async () => {
    let n = await pedirDato("Número n para sumar cuadrados:", { negativo: false });
    if (!n) return;

    // Algoritmo squaresSum [cite: 40, 41]
    const squaresSum = (num) => {
        let total = 0;
        for(let i=1; i<=num; i++) total += Math.pow(i, 2);
        return total;
    };

    botRespuesta(`La suma de cuadrados hasta ${n} es: <b>${squaresSum(Number(n))}</b>`);
};
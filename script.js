const radios = document.querySelectorAll("input[name='clase']");
const octetos = [o1, o2, o3, o4];
const inicio = [ini1, ini2, ini3, ini4];
const fin = [fin1, fin2, fin3, fin4];

let claseSeleccionada = "";
let ipValidada = false;

const rangos = {
  A: { min: 0, max: 127, inicio: [0,0,0,0], fin: [127,255,255,255], mascara: "255.0.0.0" },
  B: { min: 128, max: 191, inicio: [128,0,0,0], fin: [191,255,255,255], mascara: "255.255.0.0" },
  C: { min: 192, max: 223, inicio: [192,0,0,0], fin: [223,255,255,255], mascara: "255.255.255.0" }
};

function soloNumeros(input) {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "").slice(0, input.maxLength || 3);
  });
}

[...octetos, cantidad].forEach(soloNumeros);

radios.forEach(radio => {
  radio.addEventListener("change", () => {
    claseSeleccionada = radio.value;
    ipValidada = false;

    const r = rangos[claseSeleccionada];

    inicio.forEach((input, i) => input.value = r.inicio[i]);
    fin.forEach((input, i) => input.value = r.fin[i]);

    octetos.forEach(input => {
      input.value = "";
      input.disabled = false;
    });

    cantidad.value = "";
    cantidad.disabled = true;

    validar.disabled = false;
    generar.disabled = true;
    borrar.disabled = false;

    limpiarResultados();
    limpiarDireccion();

    o1.focus();
  });
});

function validarIP() {
  if (!claseSeleccionada) {
    alert("Seleccione una clase de IP");
    return;
  }

  const nums = octetos.map(input => input.value.trim());

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === "") {
      alert(`Ingrese el octeto ${i + 1}`);
      octetos[i].focus();
      return;
    }

    const valor = Number(nums[i]);
    if (valor < 0 || valor > 255) {
      alert(`El octeto ${i + 1} está fuera de rango`);
      octetos[i].value = "";
      octetos[i].focus();
      return;
    }
  }

  const valores = nums.map(Number);
  const r = rangos[claseSeleccionada];

  if (valores[0] < r.min || valores[0] > r.max) {
    alert(`La IP no pertenece a la Clase ${claseSeleccionada}`);
    o1.value = "";
    o1.focus();
    return;
  }

  ipValidada = true;

  direccionIP.value = valores.join(".");
  mascaraIP.value = "Máscara: " + r.mascara;
  claseIP.value = "Clase: " + claseSeleccionada;

  octetos.forEach(input => input.disabled = true);
  radios.forEach(radio => radio.disabled = true);

  validar.disabled = true;
  cantidad.disabled = false;
  generar.disabled = false;
  borrar.disabled = false;

  cantidad.focus();

  alert("SU DIRECCIÓN IP ES VÁLIDA");
}

validar.addEventListener("click", validarIP);

function generarSubredes() {
  if (!ipValidada) {
    alert("Primero debe validar la IP");
    return;
  }

  const total = Number(cantidad.value);

  if (!total || total <= 0) {
    alert("Ingrese cuántas IP desea generar");
    cantidad.focus();
    return;
  }

  limpiarResultados();

  const base = octetos.map(input => Number(input.value));

  let bits = 0;
  while ((2 ** bits) < total) bits++;

  const salto = 256 / (2 ** bits);
  const mascaraUltimo = 256 - salto;
  const mascara = `255.255.255.${mascaraUltimo}`;

  for (let i = 0; i < total; i++) {
    const red = base[3] + (i * salto);
    const o3extra = Math.floor(red / 256);
    const o4 = red % 256;

    const n1 = base[0];
    const n2 = base[1];
    const n3 = base[2] + o3extra;

    const subred = `${n1}.${n2}.${n3}.${o4}`;
    const primera = `${n1}.${n2}.${n3}.${o4 + 1}`;
    const ultima = `${n1}.${n2}.${n3}.${o4 + salto - 2}`;
    const broadcast = `${n1}.${n2}.${n3}.${o4 + salto - 1}`;

    listaNumero.value += `${i + 1}\n`;
    listaSubred.value += `${subred}\n`;
    listaPrimera.value += `${primera}\n`;
    listaUltima.value += `${ultima}\n`;
    listaMascara.value += `${mascara}\n`;
    listaBroadcast.value += `${broadcast}\n`;
  }

  generar.disabled = true;
  cantidad.disabled = true;

  alert("Proceso terminado con éxito");
}

generar.addEventListener("click", generarSubredes);

function limpiarResultados() {
  listaNumero.value = "";
  listaSubred.value = "";
  listaPrimera.value = "";
  listaUltima.value = "";
  listaMascara.value = "";
  listaBroadcast.value = "";
}

function limpiarDireccion() {
  direccionIP.value = "";
  mascaraIP.value = "";
  claseIP.value = "";
}

borrar.addEventListener("click", () => {
  claseSeleccionada = "";
  ipValidada = false;

  radios.forEach(radio => {
    radio.checked = false;
    radio.disabled = false;
  });

  [...octetos, cantidad, ...inicio, ...fin].forEach(input => {
    input.value = "";
    input.disabled = true;
  });

  validar.disabled = true;
  generar.disabled = true;
  borrar.disabled = true;

  limpiarResultados();
  limpiarDireccion();
});

salir.addEventListener("click", () => {
  location.reload();
});

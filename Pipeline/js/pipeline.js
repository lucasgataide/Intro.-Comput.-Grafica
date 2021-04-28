// Cria um color buffer para armazenar a imagem final.
let color_buffer = new Canvas("canvas");
color_buffer.clear();

/******************************************************************************
 * Vértices do modelo (cubo) centralizado no seu espaco do objeto. Os dois
 * vértices extremos do cubo são (-1,-1,-1) e (1,1,1), logo, cada aresta do cubo
 * tem comprimento igual a 2.
 *****************************************************************************/
//                                   X     Y     Z    W (coord. homogênea)
let vertices = [new THREE.Vector4(-1.0, -1.0, -1.0, 1.0),
    new THREE.Vector4(1.0, -1.0, -1.0, 1.0),
    new THREE.Vector4(1.0, -1.0, 1.0, 1.0),
    new THREE.Vector4(-1.0, -1.0, 1.0, 1.0),
    new THREE.Vector4(-1.0, 1.0, -1.0, 1.0),
    new THREE.Vector4(1.0, 1.0, -1.0, 1.0),
    new THREE.Vector4(1.0, 1.0, 1.0, 1.0),
    new THREE.Vector4(-1.0, 1.0, 1.0, 1.0)
];

/******************************************************************************
 * As 12 arestas do cubo, indicadas através dos índices dos seus vértices.
 *****************************************************************************/
let edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
];

/******************************************************************************
 * Matriz Model (modelagem): Esp. Objeto --> Esp. Universo. 
 * OBS: A matriz está carregada inicialmente com a identidade.
 *****************************************************************************/
let m_model = new THREE.Matrix4();

m_model.set(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);

function scaleMatriz(sx, sy, sz) { //Transformação de escala

    let Mtran_Scale = new THREE.Matrix4(); // Matriz de transformação que vai ser retornada

    Mtran_Scale.set(sx, 0.0, 0.0, 0.0,
        0.0, sy, 0.0, 0.0,
        0.0, 0.0, sz, 0.0,
        0.0, 0.0, 0.0, 1.0);

    return Mtran_Scale;
}

function shearMatriz(shx, shy, shz) { //Shear

    let Mtran_Shear = new THREE.Matrix4(); // Matriz de transformação que vai ser retornada

    Mtran_Shear.set(1.0, shy, shz, 0.0,
        shx, 1.0, shz, 0.0,
        shx, shy, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0);

    return Mtran_Shear;
}

function translateMatriz(tx, ty, tz) { //Translation

    let Mtran_Translate = new THREE.Matrix4(); // Matriz de transformação que vai ser retornada

    Mtran_Translate.set(1.0, 0.0, 0.0, tx,
        0.0, 1.0, 0.0, ty,
        0.0, 0.0, 1.0, tz,
        0.0, 0.0, 0.0, 1.0);

    return Mtran_Translate;
}

function reflectMatriz(plane) { //Reflexão em torno de um plano, plano como parametro 'XZ', 'YZ', XY'

    let Mtran_Reflect = new THREE.Matrix4(); // Matriz de translação que vai ser retornada

    if (plane == 'XZ' || plane == 'xz') { // reflexão em torno do plano xz
        Mtran_Reflect.set(1.0, 0.0, 0.0, 0.0,
            0.0, -1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
    } else if (plane == 'YZ' || plane == 'yz') { // em torno do plano yz
        Mtran_Reflect.set(-1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
    } else if (plane == 'XY' || plane == 'xy') { // em torno do plano xy
        Mtran_Reflect.set(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, -1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
    }
    return Mtran_Reflect;
}

function rotateMatriz(eixo, angulo) {

    let rad = angulo * Math.PI / 180.0;

    let cos = Math.cos(rad);
    let sen = Math.sin(rad);

    let Mtran_Rotate = new THREE.Matrix4();

    if (eixo == 'X' || eixo == 'x') {
        Mtran_Rotate.set(1.0, 0.0, 0.0, 0.0,
            0.0, cos, -sen, 0.0,
            0.0, sen, cos, 0.0,
            0.0, 0.0, 0.0, 1.0);
    } else if (eixo == 'Y' || eixo == 'y') {
        Mtran_Rotate.set(cos, 0.0, sen, 0.0,
            0.0, 1.0, 0.0, 0.0, -sen, 0.0, cos, 0.0,
            0.0, 0.0, 0.0, 1.0);
    } else if (eixo == 'Z' || eixo == 'z') {
        Mtran_Rotate.set(cos, -sen, 0.0, 0.0,
            sen, cos, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0);
    }

    return Mtran_Rotate;

}

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_model);


/******************************************************************************
 * Parâmetros da camera sintética.
 *****************************************************************************/
let origem = new THREE.Vector3(0.0, 0.0, 0.0);
let cam_pos = new THREE.Vector3(1.3, 1.7, 2.0); // posição da câmera no esp. do Universo.
let cam_look_at = new THREE.Vector3(0.0, 0.0, 0.0); // ponto para o qual a câmera aponta.
let cam_up = new THREE.Vector3(0.0, 1.0, 0.0); // vetor Up da câmera.

/******************************************************************************
 * Matriz View (visualização): Esp. Universo --> Esp. Câmera
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

// Derivar os vetores da base da câmera a partir dos parâmetros informados acima.
//zcam = -d / |d|;
//prodvetxcam = u prodvet zcam;
//xcam = norma (prodvetxcam);
//prodvetycam = xcam prodvet zcam
//ycam = norma (prodvetycam)
// ---------- implementar aqui ----------------------------------------------

let direction_cam = new THREE.Vector3(); // vetor de direção da camêra

direction_cam = cam_look_at; // copia o ponto para aonde a camera aponta
direction_cam = direction_cam.sub(cam_pos); //subtrai a posição desse ponto

console.log('vetor direcao');
console.log(direction_cam);

let z_base_cam = new THREE.Vector3();

z_base_cam = direction_cam; // copia o vetor direção
z_base_cam = z_base_cam.normalize(); // faz a norma do vetor direção
z_base_cam = z_base_cam.negate(); // inverte

let x_base_cam = new THREE.Vector3();

x_base_cam = cam_up; // copia cam_up para x_base
x_base_cam = x_base_cam.cross(z_base_cam); // faz o produto vetorial do up com o o vetor z da base
x_base_cam = x_base_cam.normalize(); // faz a norma do vetor

let y_base_cam = new THREE.Vector3();

y_base_cam = x_base_cam; // copia o vetor x da base
y_base_cam = y_base_cam.cross(z_base_cam); // faz o produto vetorial do vetor x com o vetor z
y_base_cam = y_base_cam.normalize(); // faz a norma, mas n é necessário pq o produto vetorial foi feito com 2 vetores unitarios

console.log('vetor base x');
console.log(x_base_cam);
console.log('vetor base y');
console.log(y_base_cam);
console.log('vetor base z');
console.log(z_base_cam);

// Construir 'm_bt', a inversa da matriz de base da câmera.

// ---------- implementar aqui ----------------------------------------------
let m_bt = new THREE.Matrix4();

m_bt.set(x_base_cam.x, x_base_cam.y, x_base_cam.z, 0.0, // matriz transposta dos vetores da camera
    y_base_cam.x, y_base_cam.y, y_base_cam.z, 0.0,
    z_base_cam.x, z_base_cam.y, z_base_cam.z, 0.0,
    0.0, 0.0, 0.0, 1.0);

console.log(m_bt);
// Construir a matriz 'm_t' de translação para tratar os casos em que as
// origens do espaço do universo e da câmera não coincidem.

// ---------- implementar aqui ----------------------------------------------

let vetor_translacao = new THREE.Vector3();

vetor_translacao = cam_pos; // vetro translacao para ser feita a matriz de translacao
vetor_translacao = vetor_translacao.sub(origem); // Vt = coordenada inicial - coordenada destino, no nosso caso a origem

console.log('vetor translacao');
console.log(vetor_translacao);

let m_t = new THREE.Matrix4();

m_t = translateMatriz(-vetor_translacao.x, -vetor_translacao.y, -vetor_translacao.z);

console.log('matriz translacao');
console.log(m_t);

// Constrói a matriz de visualização 'm_view' como o produto
//  de 'm_bt' e 'm_t'.
let m_view = m_bt.clone().multiply(m_t);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_view);

/******************************************************************************
 * Matriz de Projecao: Esp. Câmera --> Esp. Recorte
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

// ---------- implementar aqui ----------------------------------------------
let m_projection = new THREE.Matrix4();

m_projection.set(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_projection);

/******************************************************************************
 * Homogeneizacao (divisao por W): Esp. Recorte --> Esp. Canônico
 *****************************************************************************/

// ---------- implementar aqui ----------------------------------------------

/******************************************************************************
 * Matriz Viewport: Esp. Canônico --> Esp. Tela
 * OBS: A matriz está carregada inicialmente com a identidade. 
 *****************************************************************************/

// ---------- implementar aqui ----------------------------------------------
let m_viewport = new THREE.Matrix4();

m_viewport.set(1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);

for (let i = 0; i < 8; ++i)
    vertices[i].applyMatrix4(m_viewport);

/******************************************************************************
 * Rasterização
 *****************************************************************************/

// ---------- implementar aqui ----------------------------------------------

color_buffer.putPixel(vertices[6].x, vertices[6].y, [255, 0, 0]);
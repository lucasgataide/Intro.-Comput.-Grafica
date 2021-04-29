// Classe do professor
class Canvas {
    constructor(canvas_id) {
        this.canvas = document.getElementById(canvas_id);
        this.context = this.canvas.getContext("2d");
        this.clear_color = 'rgba(0,0,0,255)';
    }

    clear() {
        this.context.fillStyle = this.clear_color;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    putPixel(x, y, color) {
        this.context.fillStyle = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
        this.context.fillRect(x, (this.canvas.height - 1) - y, 1, 1);
    }
}


function MidPointLineAlgorithm(x0, y0, x1, y1, color_0, color_1) {

    //verificação da abstração necessária do algoritmo
    //Através dos deltas é verifiado o octante aonde a reta se encontra

    if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) { // se delta x > delta y, a reta se encontra nos octantes 1, 4, 5 ou 8
        if (x0 > x1) {
            plotAxleX(x1, y1, x0, y0, color_1, color_0) // se x0 > x1, octante 1 ou 8
        } else {
            plotAxleX(x0, y0, x1, y1, color_0, color_1) // se x0 < x1, octante 4 ou 5
        }
    } else { // se não (delta y > delta x), octantes 2, 3, 6 e 
        if (y0 > y1) {
            plotAxleY(x1, y1, x0, y0, color_1, color_0) // se y0 > y1, octantes 2 e 3
        } else {
            plotAxleY(x0, y0, x1, y1, color_0, color_1) // y1 > y0, octantes 6 e 7
        }
    }

    function plotAxleX(x0, y0, x1, y1, color_0, color_1) { // Rasteriza a linha em função do eixo X
        let dx = x1 - x0;
        let dy = y1 - y0;
        let yi = 1;

        let cor = color_0.slice(); //faz uma copia do array da cor para ser utilizada pela função
        let cor2 = color_1.slice();
        let dred = (cor2[0] - cor[0]) / dx; //através da diferença entre a cor final e inicial,
        let dgreen = (cor2[1] - cor[1]) / dx; // dividida pelo tamanho da linha em relacao
        let dblue = (cor2[2] - cor[2]) / dx; // ao eixo, se descobre o quanto cada cor deve ser incrementada

        if (dy < 0) { //se for na ordem normal, de x0 pra x1 ele incrementa, se for na ordem contraria ele decrementa
            yi = -1;
            dy = -dy;
        }

        let d = (2 * dy) - dx; // variavel derivada da equação da reta 
        let y = y0;
        let x;

        for (x = x0; x < x1; x++) { //o eixo x nessa função é incremetnada a cada iteração

            color_buffer.putPixel(x, y, cor);

            cor[0] = cor[0] + dred;
            cor[1] = cor[1] + dgreen;
            cor[2] = cor[2] + dblue;

            if (d > 0) { //Se for positivo, está acima da reta ideal, incrementando o eixo y
                y = y + yi;
                d = d + (2 * (dy - dx));
            } else { // se for negativo, está abaixo da reta ideal, logo não incrementa o eixo y
                d = d + 2 * dy;
            }
        }

        color_buffer.putPixel(x1, y1, cor2);
    }

    function plotAxleY(x0, y0, x1, y1, color_0, color_1) { //Rasterização em função do eixo Y
        let dx = x1 - x0;
        let dy = y1 - y0;
        let xi = 1;

        let cor = color_0.slice();
        let cor2 = color_1.slice();
        let dred = (cor2[0] - cor[0]) / dy;
        let dgreen = (cor2[1] - cor[1]) / dy;
        let dblue = (cor2[2] - cor[2]) / dy;


        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }

        let d = (2 * dx) - dy; // variável de decisão para a escolha do pixel
        let x = x0;
        let y;

        for (y = y0; y < y1; y++) {

            color_buffer.putPixel(x, y, cor);
            cor[0] = cor[0] + dred;
            cor[1] = cor[1] + dgreen;
            cor[2] = cor[2] + dblue;

            if (d > 0) {
                x = x + xi;
                d = d + (2 * (dx - dy));
            } else {
                d = d + 2 * dx;
            }
        }

        color_buffer.putPixel(x1, y1, cor2);
    }
}

function DrawTriangle(x0, y0, x1, y1, x2, y2, color_0, color_1, color_2) {

    MidPointLineAlgorithm(x0, y0, x1, y1, color_0, color_1);
    MidPointLineAlgorithm(x1, y1, x2, y2, color_1, color_2);
    MidPointLineAlgorithm(x2, y2, x0, y0, color_2, color_0);

}
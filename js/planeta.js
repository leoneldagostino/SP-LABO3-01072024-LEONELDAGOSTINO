import { PlanetaBase } from "./planetaBase.js";


class Planeta extends PlanetaBase {
    constructor(id, nombre, tamano, masa, tipo, distanciaAlSol, presenciaVida, poseeAnillo, composicionAtmosferica) {
        super(id, nombre, tamano, masa, tipo);
        this.distanciaAlSol = distanciaAlSol;
        this.presenciaVida = presenciaVida;
        this.poseeAnillo = poseeAnillo;
        this.composicionAtmosferica = composicionAtmosferica;
    }

    /**
     * Realiza verificacion sobre los datos del planeta
     *
     * @returns {boolean} true si los datos son correctos, false si no
     */
    verify() {
        return this.checkDistancia() && this.validarAtmosfera();
    }

    /**
     * Valida que la distancia sea un número
     *
     * @returns {boolean} true si la distancia es un número, false si no
     */
    checkDistancia() {

        if (!parseInt(this.distanciaAlSol)) {
            alert('La distancia debe ser un número');
            return false;
        }
        return true;
    }

    
    /**
     * Validar que la atmósfera sea una cadena de texto
     *
     * @returns {boolean} true si la atmósfera es una cadena de texto, false si no
     */
    validarAtmosfera() {
        if (typeof this.composicionAtmosferica != 'string') {
            alert('La atmósfera debe ser una cadena de texto');
            return false;
        }
        return true;
    }

    
}

    export { Planeta }

import { wasm as wasmTester } from 'circom_tester';
import * as path from 'path';
import { expect } from 'chai';
import { describe, before } from 'mocha';
import { PERSONA_DUMMY_INPUT,generatePersonaCircuitInput } from '@selfxyz/common/utils/persona/utilis';
describe('should verify signature on random inputs', () => {
    let circuit;


    before(async function () {
        this.timeout(0);
        circuit = await wasmTester(
            path.join(__dirname, '../../circuits/disclose/vc_and_disclose_persona.circom'),
            {
              verbose: true,
              logOutput: true,
              include: [
                  'node_modules',
                  'node_modules/@zk-kit/binary-merkle-root.circom/src',
                  'node_modules/circomlib/circuits',
                  'circuits',
                  'circuits/utils',
                  'circuits/utils/persona',
              ],
          }
        );
    });

    it('should compile and load the circuit', async function () {
        expect(circuit).to.not.be.undefined;
    });
    it('should verify for correct Circuit Input and output ', async function () {
      this.timeout(0);
      const input = generatePersonaCircuitInput(PERSONA_DUMMY_INPUT, ["gender", "dob"]);
      const witness = await circuit.calculateWitness(input);
      await circuit.checkConstraints(witness);
    });
    it('should fail for incorrect Input  ', async function () {
        this.timeout(0);
        const input = generatePersonaCircuitInput(PERSONA_DUMMY_INPUT, ["gender", "dob"]);
        input.PersonaID_data_padded.slice(0, 30).fill("1");
        try {
            const witness = await circuit.calculateWitness(input);
            await circuit.checkConstraints(witness);
            expect.fail('Expected an error but none was thrown.');
        } catch (error) {
            expect(error.message).to.include('Assert Failed');
        }
    });


});

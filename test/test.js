const serverlessPluginConditionalFunctions = require("../index");
const expect = require('chai').expect

let serverlessFile = {};

describe("Test Serverless Conditional Functions", () => {
    before(() => {
        serverlessFile = getServerlessFile();
        const serverlessConditionalFunction = new serverlessPluginConditionalFunctions(serverlessFile);
        serverlessConditionalFunction.applyConditions();
    });

    it("Function without enabled key should be defined", () => {
        expect(serverlessFile.service.functions.enabledFuncNoKey).to.exist;
    });

    it("Functions with enabled='true' should be defined", () => {
        expect(serverlessFile.service.functions.enabledFuncTrue).to.exist;
    });

    it("Functions with complex true condition should be defined", () => {
        console.log(serverlessFile.service.provider)
        expect(serverlessFile.service.functions.enabledFuncComplex).to.exist;
    });

    it("Functions with enabled='false' should be undefined", () => {
        expect(serverlessFile.service.functions.disabledFuncFalse).to.be.an('undefined');
    });

    it("Functions with complex false condition should be undefined", () => {
        expect(serverlessFile.service.functions.disabledFuncComplex).to.be.an('undefined');
    });
});

const getServerlessFile = function () {
    return {
        service: {
            service: "Test Serverless Service",
            provider: {
                stage: 'test',
                profile: 'default',
            },
            functions: {
                enabledFuncNoKey:
                {
                    name: "Function 1",
                },
                enabledFuncTrue:
                {
                    name: "Function 2",
                    enabled: 'true'
                },
                enabledFuncComplex:
                {
                    name: "Function 3",
                    enabled: '"test" == "test"'
                },
                disabledFuncFalse:
                {
                    name: "Function 4",
                    enabled: 'false'
                },
                disabledFuncComplex:
                {
                    name: "Function 5",
                    enabled: '"test" != "test"'
                },
            }
        }
    };
};

/**
 * Author: Guochao Xie @XieGuochao
 * Date: 10-06-2023
 * Description: ChatGPT Wrapper Toolkit Test
 * License: MIT
 */



console.log("Test Start.");
function initOAccount() {
    return new OAccount(CREDENTIAL.org, CREDENTIAL.api_key, CREDENTIAL.default_model);
};

QUnit.module('OAccount', function () {
    QUnit.test('save-load', async function (assert) {
        const oaccount = initOAccount();
        await oaccount.save();
        const oaccount2 = new OAccount();
        await oaccount2.load();
        assert.equal(oaccount.org, oaccount2.org);
        assert.equal(oaccount.api_key, oaccount2.api_key);
        assert.equal(oaccount.default_model, oaccount2.default_model);
    });

    QUnit.test('save-load-changed', async function (assert) {
        const oaccount = initOAccount();
        await oaccount.save();
        const oaccount2 = new OAccount();
        await oaccount2.load();
        oaccount2.api_key = "123";
        await oaccount2.save();
        const oaccount3 = new OAccount();
        await oaccount3.load();
        assert.equal(oaccount.org, oaccount3.org);
        assert.notEqual(oaccount.api_key, oaccount3.api_key);
        assert.equal(oaccount.default_model, oaccount3.default_model);
    });
});

QUnit.module('Models', function () {
    const oaccount = initOAccount();
    QUnit.test('list', async function (assert) {
        const models = oaccount.models();
        const [result, _, __] = await models.list();
        assert.ok(result.length > 0);
    });

    const model = oaccount.default_model;
    QUnit.test('retrieve', async function (assert) {
        const models = oaccount.models();
        const [result, _, __] = await models.retrieve(model);
        assert.equal(result.id, model);
    });

    QUnit.test('retrieve-404', async function (assert) {
        const models = oaccount.models();
        const [result, errorcode, __] = await models.retrieve("invalid-model");
        assert.equal(result, null);
        assert.equal(errorcode, 404);
    });

    QUnit.test('get-type', async function (assert) {
        const models = oaccount.models();
        const result = await models.getType(model);
        assert.equal(result, "CHAT");
    });

    QUnit.test('get-type-unknown', async function (assert) {
        const models = oaccount.models();
        const result = await models.getType("unknown-model");
        assert.equal(result, "UNKNOWN");
    });
});

QUnit.module("OHistory", function() {
    QUnit.test("append", function(assert) {
        const ohistory = new OHistory();
        ohistory.append("hello");
        ohistory.append("world", 1, "ok");
        assert.equal(ohistory.history.length, 2);
        assert.equal(ohistory.history[0], "hello");
        assert.equal(ohistory.history[1], "world");
        assert.equal(ohistory.token_usages[1], 1);
        assert.equal(ohistory.finish_reasons[1], "ok");
    });
});

QUnit.module("OChat", function() {
    const oaccount = initOAccount();

    QUnit.test("ask", async function(assert) {
        const ochat = new OChat(oaccount, "gpt-3.5-turbo");
        const [result, errorcode, __] = await ochat.ask("hello");
        assert.equal(errorcode, 0);
        console.log(result);
        assert.ok(result !== null);
        assert.equal(ochat.model, "gpt-3.5-turbo");
    });

    QUnit.test("ask-with-history", async function(assert) {
        const ochat = new OChat(oaccount, "gpt-3.5-turbo");
        {
            const [result, errorcode, __] = await ochat.ask("hello");
            assert.equal(errorcode, 0);
            assert.ok(result !== null);
        }
        {
            const [result, errorcode, __] = await ochat.ask("how are you?");
            assert.equal(errorcode, 0);
            assert.ok(result !== null);
            assert.ok(ochat.history.history.length == 4);
            assert.ok(ochat.history.token_usages.length == 4);
            assert.ok(ochat.history.finish_reasons.length == 4);
        }
    });
});
const { Application } = require("lisk-sdk");
const { genesisBlockDevnet, configDevnet } = require("./config");
const QuestionTransaction = require("./transaction/51_question_transaction");
const AnswerTransaction = require("./transaction/52_answer_transaction");

const app = new Application(genesisBlockDevnet, configDevnet);
app.registerTransaction(QuestionTransaction);
app.registerTransaction(AnswerTransaction);

app
	.run()
	.then(() => app.logger.info("App started..."))
	.catch(error => {
		console.error("Faced error in application", error);
		process.exit(1);
	});
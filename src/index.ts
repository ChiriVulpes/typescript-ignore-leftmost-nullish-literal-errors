import type { } from "ts-expose-internals";
import ts, { BinaryExpression, SyntaxKind } from "typescript";
import type { GirlbossPlugin } from "typescript-girlboss";

export default {
	transformDiagnostics (api) {
		const node = api.node;
		if (!isNullishCoalesceExpression(node))
			return;

		const left = ts.skipOuterExpressions(node.left);
		if (!isNullishLiteral(left) || !isLeftmostNullishCoalesceOperand(node))
			return;

		api.removeNodeDiagnostics();
	},
	// transformSourceFile (sourceFile) {
	// 	(sourceFile as any).statements = ts.setTextRangePosEnd([
	// 		ts.setTextRangePosEnd(ts.factory.createVariableStatement(
	// 			undefined,
	// 			ts.setTextRangePosEnd(ts.factory.createVariableDeclarationList(
	// 				[ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createVariableDeclaration(
	// 					ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createIdentifier("Undefined"), 0, 0), 0),
	// 					undefined,
	// 					undefined,
	// 					ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createIdentifier("undefined"), 0, 0), 0),
	// 				), 0, 0), 0)],
	// 			), 0, 0),
	// 		), 0, 0),
	// 		ts.setTextRangePosEnd(ts.factory.createVariableStatement(
	// 			undefined,
	// 			ts.setTextRangePosEnd(ts.factory.createVariableDeclarationList(
	// 				[ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createVariableDeclaration(
	// 					ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createIdentifier("Null"), 0, 0), 0),
	// 					undefined,
	// 					undefined,
	// 					ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createNull(), 0, 0), 0),
	// 				), 0, 0), 0)],
	// 			), 0, 0),
	// 		), 0, 0),
	// 		...sourceFile.statements,
	// 	] as any, sourceFile.pos, sourceFile.end);
	// },
	// transformAST (api) {
	// 	const node = api.node;
	// 	if (node.kind === ts.SyntaxKind.SourceFile)
	// 		return;

	// 	if (!isNullishCoalesceExpression(node))
	// 		return;

	// 	const left = ts.skipOuterExpressions(node.left);
	// 	if (!isNullishLiteral(left))
	// 		return;

	// 	if (!isLeftmostNullishCoalesceOperand(node))
	// 		return;

	// 	const newLeft = ts.setNodeFlags(ts.setTextRangePosEnd(ts.factory.createIdentifier(left.kind === SyntaxKind.NullKeyword ? "Null" : "Undefined"), left.pos ?? 0, left.end ?? 0), left.flags);
	// 	(newLeft as any).parent = left.parent;
	// 	api.queueNodeReplacement(left, newLeft);
	// },
} as GirlbossPlugin;

function isNullishCoalesceExpression (node: ts.Node): node is ts.BinaryExpression {
	return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken;
}

function isNullishLiteral (node: ts.Node) {
	return node.kind === ts.SyntaxKind.NullKeyword || (ts.isIdentifier(node) && node.escapedText === "undefined");
}

function isNotWithinNullishCoalesceExpression (node: BinaryExpression) {
	return false
		|| !node.parent
		|| !ts.isBinaryExpression(node.parent)
		|| node.parent.operatorToken.kind !== SyntaxKind.QuestionQuestionToken;
}

function isLeftmostNullishCoalesceOperand (node: BinaryExpression) {
	while (node.parent && ts.isBinaryExpression(node.parent) && node.parent.operatorToken.kind === SyntaxKind.QuestionQuestionToken && node.parent.left === node)
		node = node.parent;

	return isNotWithinNullishCoalesceExpression(node);
}

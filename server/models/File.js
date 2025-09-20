import mongoose from "mongoose";

const CODE_SNIPPETS = {
	c: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello World");\n\n\treturn 0;\n}\n`,
	cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\ncout << "Hello World";\n\nreturn 0;\n}',
	python: `def greet():\n\tprint("Hello World")\ngreet()\n`,
	javascript: `function greet(){\n\tconsole.log("Hello World");\n}\ngreet();\n`,
};

const fileSchema = mongoose.Schema(
	{
		filename: { type: String, required: true, unique: true },
		code: {
			type: Map,
			of: String,
			default: {
				javascript: CODE_SNIPPETS.javascript,
				python: CODE_SNIPPETS.python,
				c: CODE_SNIPPETS.c,
				cpp: CODE_SNIPPETS.cpp,
			},
		},
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

const File = mongoose.model("File", fileSchema);
export default File;

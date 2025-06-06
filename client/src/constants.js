export const LANGUAGES = {
	c: "10.2.0",
	cpp: "10.2.0",
	python: "3.10.0",
	javascript: "18.15.0",
};
	
export const CODE_SNIPPETS = {
	c: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello World");\n\n\treturn 0;\n}\n`,
	cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\ncout << "Hello World";\n\nreturn 0;\n}',
	python: `def greet():\n\tprint("Hello World")\ngreet()\n`,
	javascript: `function greet(){\n\tconsole.log("Hello World");\n}\ngreet();\n`,
};

export const PLACEHOLDER = `Example:
for enter x
	  enter y enter z
you can do:
	  2 
	  3 4
which assigns: x=2,y=3,z=4

Also, you don't need input message like: "Enter x:"
It will only make your output look ugly!
`;

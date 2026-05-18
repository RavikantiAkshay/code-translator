const LANGUAGES = [
  { id: "c", name: "C" },
  { id: "cpp", name: "C++" },
  { id: "csharp", name: "C#" },
  { id: "java", name: "Java" },
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
];

const MONACO_LANGUAGES = {
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  java: "java",
  python: "python",
  javascript: "javascript",
  typescript: "typescript",
};

const STARTER_CODE = {
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, World!");\n    return 0;\n}`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}`,
  csharp: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  python: `print("Hello, World!")`,
  javascript: `console.log("Hello, World!");`,
  typescript: `const greet = (name: string): string => {\n    return \`Hello, \${name}!\`;\n};\n\nconsole.log(greet("World"));`,
};

export { LANGUAGES, MONACO_LANGUAGES, STARTER_CODE };
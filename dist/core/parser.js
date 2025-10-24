import { Project } from "ts-morph";
export function parseFile(filePath) {
    const project = new Project({ useInMemoryFileSystem: false });
    const source = project.addSourceFileAtPath(filePath);
    return {
        source,
        functions: source.getFunctions(),
        imports: source.getImportDeclarations().map(d => d.getModuleSpecifierValue()),
    };
}
//# sourceMappingURL=parser.js.map
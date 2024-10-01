
# Treecraft - File Structure Generator

**Treecraft** is a VS Code extension that allows you to automatically generate file and folder structures based on a text file containing an arborescence. This tool is perfect for quickly setting up project scaffolding, organizing codebases, or creating templates for new projects.

## Features

- **Generate File and Folder Structures**: Treecraft reads a text file describing a directory tree and creates corresponding folders and files in your target directory.
- **Customizable Input**: Input is provided through a simple text file with hierarchical lines representing folders and files.
- **Flexible**: Supports nested folder structures and multiple files per directory.
- **Comments**: Treecraft ignores commented lines starting with `#`, allowing you to annotate your structure file.
  
## How It Works

1. **Create Your Structure File**: Write a `.txt` file with the desired folder and file structure using indentation and tree-like formatting.
   
   Example of a structure file:
   ```
   /MyMicroserviceApp
   ├─── Controllers
   │    └── ProductsController.cs
   ├─── Models
   │    └── Product.cs
   ├─── Data
   │    └── ProductDbContext.cs
   ├─── appsettings.json
   ├─── Program.cs
   ├─── Startup.cs
   └─── Dockerfile
   ```

2. **Run the Command**: 
   - Open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
   - Run the command: **Treecraft: Create File Tree from Text**.

3. **Select the Input File**: 
   - Select the text file containing the file tree structure.

4. **Choose Target Directory**: 
   - Choose the folder where the files and directories should be created.

5. **Success**: Treecraft will generate the file and folder structure in the selected directory, allowing you to start working on your project immediately.

## Example Usage

### Input Text File

```
MyMicroserviceApp
    Controllers
        ProductsController.cs
    Models
        Product.cs
    Data
        ProductDbContext.cs
    appsettings.json
    Program.cs
```

### Another version of the input 

```
MyMicroserviceApp
├─── Controllers
│    └── ProductsController.cs
├─── Models
│    └── Product.cs
├─── Data
│    └── ProductDbContext.cs
├─── appsettings.json
├─── Program.cs
└─── Startup.cs
```

## Installation

1. Open **Visual Studio Code**.
2. Go to the **Extensions** view by clicking on the Extensions icon in the Activity Bar or using the shortcut (`Ctrl+Shift+X`).
3. Search for **Treecraft** and click **Install**.

Alternatively, you can install it via the command line:

```bash
code --install-extension your-publisher-name.treecraft
```

## Requirements

- **Node.js**: Required for running the extension.
- **VS Code 1.60+**: Ensure you are using a compatible version of VS Code.

## Known Issues

- Ensure your input text file uses consistent indentation (spaces or tabs) to avoid any structure parsing issues.

## Contributing

Feel free to open issues or contribute by submitting pull requests. We welcome improvements to make Treecraft even better!

## License

MIT License


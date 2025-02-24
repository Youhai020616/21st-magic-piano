{ pkgs }: {
  description = "A basic web development environment";
  
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.nodePackages.yarn
    pkgs.nodePackages.npm
  ];
}

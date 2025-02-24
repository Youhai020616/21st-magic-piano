{
  description = "A basic web development environment";
  
  deps = {
    channel = "stable-22_11";
    pkgs = [
      pkgs.nodejs-18_x
      pkgs.nodePackages.typescript
      pkgs.nodePackages.yarn
      pkgs.replitPackages.jest
    ];
  };
}

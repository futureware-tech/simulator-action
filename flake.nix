{
  description = "simulator-action";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    fw_nix = {
      url = "github:futureware-tech/nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      fw_nix,
    }:
    let
      forAllSystems =
        f:
        nixpkgs.lib.genAttrs nixpkgs.lib.systems.flakeExposed (
          system:
          f {
            inherit system;
            pkgs = import nixpkgs { inherit system; };
          }
        );
    in
    {
      checks = forAllSystems (
        { system, ... }: {
          pre-commit-check = fw_nix.inputs.git-hooks.lib.${system}.run {
            src = ./.;
            hooks = fw_nix.lib.pre-commit.hooks // {
              # Disabled to prevent conflicts with prettier on JS/TS files
              clang-format.enable = false;
            };
            excludes = [
              "^dist/"
              "^\\.github/workflows/update-overlays\\.yml$"
            ];
          };
        }
      );

      devShells = forAllSystems (
        { system, pkgs, ... }:
        {
          default = pkgs.mkShell {
            buildInputs = with pkgs; [
              nodejs_24 # keep in sync with .nvmrc
            ];
            shellHook = self.checks.${system}.pre-commit-check.shellHook;
          };
        }
      );
    };
}

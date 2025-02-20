
import { Button } from "@/components/ui/button";
import { Download, Terminal, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Hero = () => {
  const [showScript, setShowScript] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText("curl -sL hanzo.sh | sh");
    toast.success("Command copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 bg-background">
      <div className="max-w-7xl mx-auto grid grid-cols-1 gap-12">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Develop & Deploy with Hanzo
          </h1>
          <p className="text-lg text-white/80 max-w-xl">
            Install Hanzo Platform locally using this simple command:
          </p>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg max-w-xl">
            <code className="text-white font-mono">curl -sL hanzo.sh | sh</code>
            <Button 
              variant="ghost" 
              size="icon"
              className="ml-auto hover:bg-white/10"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowScript(!showScript)}
          >
            <Terminal className="w-4 h-4" />
            {showScript ? "Hide Installation Script" : "View Installation Script"}
          </Button>

          {showScript && (
            <div className="bg-white/5 p-6 rounded-lg overflow-x-auto">
              <pre className="text-sm text-white/80 font-mono">
                <code>{`#!/bin/bash

# Function to install Hanzo Platform
install_hanzo() {
  # Check if running as root
  if [ "$(id -u)" != "0" ]; then
    echo "This script must be run as root" >&2
    exit 1
  fi

  # OS and Environment Checks
  if [ "$(uname)" = "Darwin" ]; then
    echo "This script must be run on Linux" >&2
    exit 1
  fi

  if [ -f /.dockerenv ]; then
    echo "This script must be run on Linux" >&2
    exit 1
  fi

  # Port availability checks
  if ss -tulnp | grep ':80 ' >/dev/null; then
    echo "Error: something is already running on port 80" >&2
    exit 1
  fi

  if ss -tulnp | grep ':443 ' >/dev/null; then
    echo "Error: something is already running on port 443" >&2
    exit 1
  fi

  # Docker installation check and setup
  command_exists() {
    command -v "$@" > /dev/null 2>&1
  }

  if command_exists docker; then
    echo "Docker already installed"
  else
    curl -sSL https://get.docker.com | sh
  fi

  # Initialize Docker Swarm
  docker swarm leave --force 2>/dev/null

  # IP Address Detection
  get_ip() {
    local ip=""
    # Try IPv4 with multiple services
    ip=$(curl -4s --connect-timeout 5 https://ifconfig.io 2>/dev/null)
    if [ -z "$ip" ]; then
      ip=$(curl -4s --connect-timeout 5 https://icanhazip.com 2>/dev/null)
    fi
    if [ -z "$ip" ]; then
      ip=$(curl -4s --connect-timeout 5 https://ipecho.net/plain 2>/dev/null)
    fi
    
    # Try IPv6 if IPv4 fails
    if [ -z "$ip" ]; then
      ip=$(curl -6s --connect-timeout 5 https://ifconfig.io 2>/dev/null)
      if [ -z "$ip" ]; then
        ip=$(curl -6s --connect-timeout 5 https://icanhazip.com 2>/dev/null)
      fi
      if [ -z "$ip" ]; then
        ip=$(curl -6s --connect-timeout 5 https://ipecho.net/plain 2>/dev/null)
      fi
    fi

    if [ -z "$ip" ]; then
      echo "Error: Could not determine server IP address" >&2
      exit 1
    fi
    echo "$ip"
  }

  # Setup and Configuration
  advertise_addr="${ADVERTISE_ADDR:-$(get_ip)}"
  echo "Using advertise address: $advertise_addr"

  # Initialize Docker Swarm
  docker swarm init --advertise-addr $advertise_addr
  if [ $? -ne 0 ]; then
    echo "Error: Failed to initialize Docker Swarm" >&2
    exit 1
  fi

  # Network Setup
  docker network rm -f hanzo-network 2>/dev/null
  docker network create --driver overlay --attachable hanzo-network

  # Directory Setup
  mkdir -p /etc/hanzo
  chmod 777 /etc/hanzo

  # Pull Required Images
  docker pull postgres:16
  docker pull redis:7
  docker pull traefik:v3.1.2
  docker pull hanzo/platform:latest

  # Deploy Hanzo Service
  docker service create \
    --name hanzo \
    --replicas 1 \
    --network hanzo-network \
    --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
    --mount type=bind,source=/etc/hanzo,target=/etc/hanzo \
    --mount type=volume,source=hanzo-docker-config,target=/root/.docker \
    --publish published=3000,target=3000,mode=host \
    --update-parallelism 1 \
    --update-order stop-first \
    --constraint 'node.role == manager' \
    -e ADVERTISE_ADDR=$advertise_addr \
    hanzo/platform:latest

  # Success Message
  GREEN="\\033[0;32m"
  YELLOW="\\033[1;33m"
  BLUE="\\033[0;34m"
  NC="\\033[0m"

  format_ip_for_url() {
    local ip="$1"
    if echo "$ip" | grep -q ':'; then
      echo "[${ip}]"
    else
      echo "${ip}"
    fi
  }

  formatted_addr=$(format_ip_for_url "$advertise_addr")
  echo ""
  printf "${GREEN}Congratulations, hanzo is installed!${NC}\\n"
  printf "${BLUE}Wait 15 seconds for the server to start${NC}\\n"
  printf "${YELLOW}Please go to http://${formatted_addr}:3000${NC}\\n\\n"
}

# Update Function
update_hanzo() {
  echo "Updating Hanzo Platform..."
  docker pull hanzo/platform:latest
  docker service update --image hanzo/platform:latest hanzo
  echo "Hanzo Platform has been updated to the latest version."
}

# Main Execution
if [ "$1" = "update" ]; then
  update_hanzo
else
  install_hanzo
fi`}</code>
              </pre>
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">What's Included:</h2>
            <ul className="list-disc list-inside text-white/80 space-y-2">
              <li>Hanzo Container Runtime</li>
              <li>Hanzo Platform</li>
              <li>Hanzo Base</li>
              <li>Easy deployment to Hanzo Cloud</li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-8">
            <div>
              <div className="text-3xl font-bold text-white">5000+</div>
              <div className="text-white/60">Active users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">30.3k</div>
              <div className="text-white/60">Installations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">1200+</div>
              <div className="text-white/60">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

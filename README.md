# 🚀 Node.js API on ECS with ALB + GitHub Actions

This project contains a simple **Node.js REST API** that is deployed to **Amazon ECS** as a task behind an **Application Load Balancer (ALB)**.  
Deployments are **automated via GitHub Actions** on every commit to the main branch.

---

## 📌 Features
- Node.js API containerized with **Docker**
- Automatic deployments to ECS on push via **GitHub Actions**
- **ECS Service** (Fargate/EC2) running tasks
- **Application Load Balancer (ALB)** for:
  - Stable DNS endpoint
  - Health checks
  - TLS/SSL termination (via ACM)
- Scalable: ECS maintains desired task count

---

## 📂 Project Structure
├── .github/workflows/ # GitHub Actions workflows (CI/CD pipeline)
├── src/ # Node.js API source code
├── Dockerfile # Docker image build instructions
├── package.json # Node.js dependencies
└── README.md # Project documentation


---

## ⚙️ How It Works

### Architecture
User → Internet → ALB → Target Group → ECS Service → ECS Task (Node.js API)



### Deployment Flow
1. Developer pushes code to **GitHub main branch**
2. GitHub Actions workflow:
   - Builds Docker image
   - Pushes image to **Amazon ECR**
   - Updates ECS service with new task definition
3. ECS launches new task(s)
4. ALB routes traffic to the new healthy task

---

## 🚀 Setup

### 1. Prerequisites
- AWS account with:
  - ECS Cluster + Service
  - ALB + Target Group
  - ECR Repository
- GitHub repository with:
  - `.github/workflows/deploy.yml` workflow
- AWS cognitor Identity to connect with github

### 2. Running Locally
```bash
npm install
npm run start
```

Build Docker Image
```
docker build -t node-api .
docker run -p 3000:3000 node-api
```
GitHub Actions Workflow (Simplified)

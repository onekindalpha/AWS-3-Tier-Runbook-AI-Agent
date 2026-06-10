export const pages = [
  {
    id: 'overview',
    title: 'AWS 3-Tier Manual RAG Assistant',
    nav: 'Overview',
    subtitle: '정적 AWS 구축 문서를 runbook, 검증 체크리스트, 문서 검색, agent action으로 재구성한 대시보드입니다.',
    diagram: 'overview.svg',
    problem: [
      '기존 DOCX 매뉴얼은 구축 과정을 기록하고 있지만, 필요한 설정 위치와 검증 절차를 빠르게 찾기 어렵습니다.',
      'AWS 3-tier 구조는 VPC, Subnet, Security Group, ALB, EC2, API, RDS가 연결되어 있으므로 단순 문서 열람보다 절차 탐색과 원인 진단 흐름이 더 중요합니다.'
    ],
    configured: [
      '문서를 Overview, Runbook, Network, Security, Web/API/DB, Validation, Document Search, , AI Runbook Agent로 재구성했습니다.',
      'DOCX 본문은 검색 가능한 chunk로 변환하고, DOCX 이미지는 별도 Source Manual Images 페이지에서 관리합니다.',
      '각 챕터는 매뉴얼형 절차와 검증 기준을 중심으로 정리했습니다.'
    ],
    validation: [
      '문서 검색에서 VPC, Security Group, RDS, health check 등 주요 키워드가 검색되는지 확인합니다.',
      'Source Manual Images에서 DOCX 이미지가 독립 갤러리로 표시되는지 확인합니다.',
      'AI Runbook Agent에서 장애 상황별 확인 절차가 분리되어 있는지 확인합니다.'
    ]
  },
  {
    id: 'runbook',
    title: 'Manual Runbook',
    nav: 'Manual Runbook',
    subtitle: 'AWS 3-tier 구축 절차를 “어디에서 무엇을 설정하는가” 기준으로 정리합니다.',
    diagram: 'runbook.svg',
    problem: [
      '스크린샷 중심 매뉴얼은 화면은 많지만, 어떤 순서로 무엇을 설정해야 하는지 빠르게 파악하기 어렵습니다.'
    ],
    configured: [
      'VPC와 Subnet을 먼저 구성한 뒤 Route Table과 Internet Gateway 연결을 확인합니다.',
      'Security Group에서 외부 진입, Web-to-API, API-to-RDS 허용 경로를 분리합니다.',
      'ALB, Target Group, EC2, API 서버, RDS를 연결하고 마지막에 curl 또는 health endpoint로 검증합니다.'
    ],
    validation: [
      'Public Subnet은 외부 진입 경로를 갖고, Private Subnet은 내부 리소스를 보호합니다.',
      'Web/API/DB 계층은 다음 계층으로만 접근하도록 제한합니다.',
      '최종 요청은 Client → ALB → Web → API → RDS 순서로 흐릅니다.'
    ]
  },
  {
    id: 'network',
    title: 'Network Runbook',
    nav: 'Network',
    subtitle: 'VPC, Subnet, Route Table, Internet Gateway, NAT Gateway 설정 흐름을 정리합니다.',
    diagram: 'network.svg',
    problem: [
      '네트워크 구성이 잘못되면 EC2, ALB, RDS가 정상이어도 요청이 도달하지 않습니다.'
    ],
    configured: [
      'VPC 콘솔에서 전체 CIDR 범위를 만든다.',
      'Subnets에서 Public Subnet과 Private Subnet을 분리한다.',
      'Route Tables에서 Public Subnet은 Internet Gateway로 연결한다.',
      'Private Subnet은 필요한 경우 NAT Gateway 또는 내부 라우팅 경로를 확인한다.'
    ],
    validation: [
      'Public Subnet에만 외부 진입 경로가 있는지 확인합니다.',
      'Private Subnet의 App/DB 리소스가 외부 인터넷에 직접 노출되지 않는지 확인합니다.',
      'Route Table association이 의도한 Subnet에 연결되어 있는지 확인합니다.'
    ]
  },
  {
    id: 'security',
    title: 'Security Runbook',
    nav: 'Security',
    subtitle: 'NACL과 Security Group을 계층 간 허용 경로 기준으로 정리합니다.',
    diagram: 'security.svg',
    problem: [
      'Security Group을 리소스별로만 보면 전체 트래픽 경로에서 어디가 열려 있고 막혀 있는지 놓치기 쉽습니다.'
    ],
    configured: [
      'Public ALB Security Group에서 HTTP/HTTPS 인바운드를 허용한다.',
      'Web Tier Security Group에서 ALB에서 오는 요청만 허용한다.',
      'API Tier Security Group에서 Web Tier 또는 Internal ALB에서 오는 요청만 허용한다.',
      'RDS Security Group에서 API Tier만 DB 포트로 접근하도록 제한한다.'
    ],
    validation: [
      '외부 사용자가 API Tier나 RDS로 직접 접근할 수 없는지 확인합니다.',
      '각 계층은 바로 다음 계층으로만 통신하는지 확인합니다.',
      '불필요한 0.0.0.0/0 인바운드 규칙이 남아 있지 않은지 확인합니다.'
    ]
  },
  {
    id: 'web-api-db',
    title: 'Web / API / DB Runbook',
    nav: 'Web/API/DB',
    subtitle: 'ALB, Web Tier, API Tier, RDS 연결을 서비스 계층 기준으로 정리합니다.',
    diagram: 'web-api-db.svg',
    problem: [
      '네트워크와 보안이 맞아도 ALB Target Group, Web proxy, API health, DB 연결 중 하나가 어긋나면 전체 서비스가 실패합니다.'
    ],
    configured: [
      'ALB Target Group에서 Web EC2 인스턴스 등록 상태를 확인한다.',
      'Web Tier에서 API Tier로 요청을 전달하는 경로를 설정한다.',
      'API 서버에서 RDS endpoint와 DB credential 연결을 확인한다.',
      'RDS는 Private DB Subnet에 두고 API Tier에서만 접근하도록 제한한다.'
    ],
    validation: [
      'ALB health check가 정상인지 확인합니다.',
      'Web Tier에서 API endpoint 호출이 가능한지 확인합니다.',
      'API Tier에서 RDS 연결이 가능한지 확인합니다.',
      'DB 접근 실패 시 Security Group, subnet, credential을 순서대로 확인합니다.'
    ]
  },
  {
    id: 'validation',
    title: 'Validation Checklist',
    nav: 'Validation',
    subtitle: '구축 완료 후 네트워크, 보안, 서비스, DB 연결을 순서대로 검증합니다.',
    diagram: 'validation.svg',
    problem: [
      '화면이 한 번 열리는 것만으로는 3-tier 아키텍처가 정상 구성되었다고 보기 어렵습니다.'
    ],
    configured: [
      'Network validation: Subnet association, Route Table, Gateway 연결을 확인한다.',
      'Security validation: ALB → Web → API → RDS 허용 경로를 확인한다.',
      'Service validation: Target Group health, API health endpoint, DB connection을 확인한다.',
      'Runbook validation: 실패 지점별로 확인 순서를 문서화한다.'
    ],
    validation: [
      'Client 요청이 Public ALB까지 도달하는지 확인합니다.',
      'Web Tier에서 API Tier로 요청이 전달되는지 확인합니다.',
      'API Tier에서 RDS로 연결되는지 확인합니다.',
      '실패 시 AI Runbook Agent에서 진단 절차를 선택합니다.'
    ]
  },
  {
    id: 'doc-search',
    title: 'Document Search / Local RAG',
    nav: 'Document Search',
    subtitle: 'DOCX 본문을 chunk로 나누고, 질문과 관련된 근거 문장을 검색합니다.',
    diagram: 'doc-search.svg',
    type: 'rag'
  },
  {
    id: 'rag-agent',
    title: 'AI Runbook Agent',
    nav: 'AI Agent',
    subtitle: 'Groq LLM과 hybrid retrieval을 사용해 AWS 3-tier 장애 진단 절차를 생성합니다.',
    diagram: 'agent-actions.svg',
    type: 'agent'
  }
]

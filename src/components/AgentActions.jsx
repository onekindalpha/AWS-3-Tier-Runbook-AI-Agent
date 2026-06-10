const actions = [
  {
    title: 'Diagnose VPC routing',
    trigger: 'Public EC2 또는 ALB에 접근되지 않을 때',
    steps: [
      'VPC CIDR와 Subnet CIDR가 겹치지 않는지 확인한다.',
      'Public Subnet의 Route Table이 Internet Gateway로 향하는지 확인한다.',
      'Subnet association이 의도한 Public Subnet에 연결되어 있는지 확인한다.'
    ]
  },
  {
    title: 'Diagnose Security Group path',
    trigger: '계층 간 요청이 막힐 때',
    steps: [
      '요청 시작 계층의 outbound rule을 확인한다.',
      '다음 계층의 inbound rule에서 source security group을 확인한다.',
      '0.0.0.0/0로 임시 개방하지 말고 계층별 SG 참조로 제한한다.'
    ]
  },
  {
    title: 'Diagnose ALB health check',
    trigger: 'ALB Target Group이 unhealthy일 때',
    steps: [
      'Target Group의 health check path와 port를 확인한다.',
      'EC2 인스턴스가 target group에 등록되어 있는지 확인한다.',
      'Web 서버가 health check path에 응답하는지 확인한다.'
    ]
  },
  {
    title: 'Diagnose API to RDS',
    trigger: 'API 서버에서 DB 연결이 실패할 때',
    steps: [
      'RDS endpoint와 port를 API 환경 변수에서 확인한다.',
      'RDS Security Group inbound source가 API Tier SG인지 확인한다.',
      'DB credential과 DB subnet group 구성을 확인한다.'
    ]
  },
  {
    title: 'Generate validation note',
    trigger: '구축 완료 후 포트폴리오 기록을 남길 때',
    steps: [
      '증상, 의심 원인, 실제 원인, 수정한 설정, 검증 명령어 순서로 기록한다.',
      '성공 화면보다 어떤 경계를 검증했는지 중심으로 정리한다.',
      '문서 검색 결과와 실제 콘솔 캡처를 근거로 연결한다.'
    ]
  }
]

export default function AgentActions() {
  return (
    <section className="feature-panel">
      <div className="feature-header">
        <span className="section-label">Agent actions</span>
        <h2>장애 상황별 확인 절차를 action 카드로 실행한다</h2>
        <p>
          실제 브라우저 자동 조작을 수행하는 agent는 아니지만, AWS 3-tier 장애 진단 순서를
          runbook action 형태로 분리했습니다.
        </p>
      </div>

      <div className="agent-grid">
        {actions.map((action) => (
          <article className="agent-card" key={action.title}>
            <h3>{action.title}</h3>
            <p className="trigger">{action.trigger}</p>
            <ol>
              {action.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        ))}
      </div>
    </section>
  )
}

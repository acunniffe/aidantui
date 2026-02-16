# Sales Pipeline

## Lead
- order: 1
- color: #3498db
- required_info: company, source
- enter_trigger: stage-lead-enter

## Discovery
- order: 2
- color: #f39c12
- required_info: budget, timeline, decision_maker
- enter_trigger: stage-discovery-enter

## Proposal
- order: 3
- color: #e74c3c
- required_info: proposal_sent_date, proposal_value

## Negotiation
- order: 4
- color: #9b59b6
- required_info: contract_terms, stakeholders

## Closed Won
- order: 5
- color: #2ecc71
- enter_trigger: stage-closed-won-enter
- leave_trigger: stage-closed-won-leave

## Closed Lost
- order: 6
- color: #95a5a6
- enter_trigger: stage-closed-lost-enter

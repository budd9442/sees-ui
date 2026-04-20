SELECT COUNT(*) FROM "Student" WHERE current_level = 'L1';
SELECT c.program_id, p.name FROM selection_round_configs c JOIN "DegreeProgram" p ON c.program_id = p.program_id WHERE c.round_id = (SELECT round_id FROM selection_rounds WHERE type = 'PATHWAY' AND status = 'OPEN' ORDER BY created_at DESC LIMIT 1);

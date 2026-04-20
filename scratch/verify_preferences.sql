SELECT p.name, COUNT(*) FROM selection_applications sa JOIN "DegreeProgram" p ON sa.preference_1 = p.program_id WHERE sa.round_id = 'c0c56716-03f0-416f-9028-82c52b99c576' GROUP BY p.name;
SELECT p.name as pref_1, COUNT(*) FROM "Student" s JOIN "DegreeProgram" p ON s.pathway_preference_1_id = p.program_id WHERE s.current_level = 'Level 1' GROUP BY p.name;

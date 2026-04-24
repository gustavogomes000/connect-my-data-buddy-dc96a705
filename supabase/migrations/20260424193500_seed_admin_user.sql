-- Garante o usuário admin padrão com senha 12345678 (hash bcrypt)
insert into public.admin_users (username, password_hash)
values ('admin', '$2b$10$MnNKY4iSZLBTVOhVj8QAkedn4DQTzyqQ8MGC6L65K5zVq9Zk6wTgi')
on conflict (username) do update set password_hash = excluded.password_hash;

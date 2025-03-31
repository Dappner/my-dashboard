import { supabase } from "@/lib/supabase";
import type { UpdateUser, User } from "@/types/userTypes";

export const userApiKeys = {
	all: ["user"] as const,
};

export const userApi = {
	async getUser(userId: string) {
		const { data } = await supabase
			.from("users")
			.select()
			.eq("id", userId)
			.single();
		return data;
	},

	async updateUser(updateUser: UpdateUser) {
		const { id, ...user_data } = updateUser;

		const { data } = await supabase
			.from("users")
			.update({ ...user_data })
			.eq("id", id!)
			.select("*")
			.single();

		return data as User;
	},
};


export interface UserTotp {
	uuid: string;
	name: string;
	createdAt: Date;
}

export interface UserTotpAdd {
	name: string;
	secret: string;
	code: string;
	password: string;
}

export interface UserTotpRemove {
	code: string;
	password: string;
}

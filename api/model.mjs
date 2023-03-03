import mysql from 'mysql2';
import dotenv from 'dotenv';   
dotenv.config();    


// https://www.youtube.com/watch?v=Hej48pi_lOc&t=331s
// mysql2 allows async instead of callback stuff

const pool = mysql.createPool({
    connectionLimit :   10,
    host:               process.env.MYSQL_HOST,
    user:               process.env.MYSQL_USER,
    password:           process.env.MYSQL_PASSWORD,
    database:           process.env.MYSQL_DATABASE,

}).promise()


// no inputs accepted
// returns promise
// interior data is json (array of user objects)

export async function getUsers(){
    const result = await pool.query("Select * from Users");
    return result[0];
}

// inputs:  (int/str, string, string, string, string)
// output:  promise
//          interior data is json
//          {numUsersUpdated: 1, status: updated user}
//          {numUsersUpdated: 0, status: failed to update user}

export async function updateUser(user_id, username, first_name, last_name, email){
        let numberRecordsUpdated = 0
        let result_set_header;
        try {
            result_set_header = await pool.query(`
            update Users
            set username = ?, fname = ?, lname = ?, email = ?
            where user_id = ?`, 
                [username, first_name, last_name, email, user_id],
        )
        } catch(error){
            if(error.errno === CODE_UNIQUE_CONSTRAINT_FAILED){
                return {numUsersUpdated: 0, status: "null userid# issue"};
            }
            return error
        }
        
        numberRecordsUpdated = result_set_header[0].affectedRows;
        if (numberRecordsUpdated === 1){
            return {numUsersUpdated: numberRecordsUpdated, status: "updated user"};
        } else {
            return {numUsersUpdated: numberRecordsUpdated, status: "failed to update user"};
        }
}

// input str/int
// returns promise
// interior data is json 
//       {numberDeleted: 0, status: "failed to delete user"}
//       {numberDeleted: 1, status: "deleted user"}

export async function deleteUser(user_id){
    let numberRecordsUpdated = 0
    let result_set_header = await pool.query(`
        delete from Users
        where user_id = ?`, 
            [user_id],
    )
    numberRecordsUpdated = result_set_header[0].affectedRows;
    if(numberRecordsUpdated === 0){
        return {numberDeleted: numberRecordsUpdated, status: "failed to delete user"};
    } else {
        return {numberDeleted: numberRecordsUpdated, status: "deleted user"};
    }
    

}


// input: int or # as string allowed: 
// returns promise 
// interior data is json   
//    {numUsersAdded: 1, status: user added}
//    {numUsersAdded: 0, status: not unique user}
// otherwise throws error

export async function addUser(username, first_name, last_name, email){
    const CODE_UNIQUE_CONSTRAINT_FAILED = 1062;
    let numberUserAdded;
    let result_set_header;

    try{
        result_set_header = await pool.query(`
        insert into Users(username, fname, lname, email)
                values(?, ?, ?, ?)`, [username, first_name, last_name, email],
        )
    } catch(error){
        if(error.errno === CODE_UNIQUE_CONSTRAINT_FAILED){
            return {numUsersAdded: 0, status: "not unique user"};
        }
        return error
    }
   
    numberUserAdded = result_set_header[0].affectedRows;
    return {numUsersAdded: numberUserAdded, status: "user added"};
}
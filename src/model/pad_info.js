"use strict"

module.exports = {

    Pad_update: (value, start ,end ) => {
        this.value = value;
        this.start = start;
        this.end = end;
       
        return this
    },

    Pad_info: (id, value, name) =>{
        this.id = id;
        this.name = name;
        this.value = value;
        this.Needs_flushing = false;
        this.Updates = [];

        this.Add_update = (val , st , en) => {
            this.Updates.push(Pad_update(val, st , en));
        }

        this.Rmv_updates = () => {  this.Updates = []   }

        /* Get contents of this pad from pad 
        the file that it's referencing */
        this.Get_Contents= ()=>{
            // Read file
            // save contents of file in value
        }

        /*  Update the contents of the file
            that pad is refering to    */
        this.Update_file = ()=>{
            // check if pad needs flushing
            if (this.Needs_flushing){
                // get find the right file
                // try and update it's contents
                // set needs_flushing to false if successful
                this.Needs_flushing = false
            }
        }

        return this
    }

}
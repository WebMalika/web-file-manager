//TODO
if(!localStorage.getItem('folders')){
    // localStorage.setItem('folders', JSON.stringify([{
    //     parent: null,
    //     id: 0,
    //     name: "/",
    //     isPrivate: false,
    //     dateCreate: '2022-02-12'
    // }]))
    localStorage.setItem('folders', '[{"parent":null,"id":0,"name":"/","isPrivate":false,"dateCreate":"2022-02-12"},{"parent":0,"id":1,"name":"1","isPrivate":false,"dateCreate":"2022-04-30"},{"parent":1,"id":2,"name":"11-1","isPrivate":false,"dateCreate":"2022-04-30"},{"parent":1,"id":3,"name":"11-2","isPrivate":false,"dateCreate":"2022-04-30"},{"parent":2,"id":4,"name":"111-1","isPrivate":false,"dateCreate":"2022-04-30"},{"parent":2,"id":5,"name":"111-2","isPrivate":false,"dateCreate":"2022-04-30"}]')
}

if(!localStorage.getItem('files') || localStorage.getItem('files') == 'false'){
    localStorage.setItem('files', JSON.stringify([[], [], [], [], [], []]))
}

const app = Vue.createApp({
    data(){
        return {
            // main data
            folders: JSON.parse(localStorage.getItem('folders')),
            files: JSON.parse(localStorage.getItem('files')),

            // navigation 
            curFolderID: 0,
            curDisk: null,
            counterFolders: 0,
            prevFolder: false,
            nextFolder: false,

            // modal for add object
            isVisiblePrivateModal: false,
            isVisibleAddModal: false,
            typeAddObj: null,
            privateStatusAddObj: false,
            nameAddObj: '',
            textAddModal: '',

            // other
            visiblePath: '/',
            editStatus: false,
            
            selectFolders: [],
            selectFiles: [],

            // cut data
            cutOutData: {},
            putFolders: {
                files: [],
                folders: [],
            }
        }
    },
    mounted: function () { 
        this.curDisk = this.folders.filter(item => item.parent == this.curFolderID);
        this.counterFolders = this.folders.length;
    },
    methods: {
        toFolder(folder) {
            if(!folder.isPrivate){
                this.prevFolder = this.curFolderID;
                this.nextFolder = false;

                this.visiblePath += folder.name + '/';
                this.curFolderID = folder.id;

                this.selectFolders = [];
                this.selectFiles = [];
            }
        },

        toPrevFolder(){
            if(this.prevFolder === false || this.folders[this.prevFolder].isPrivate) return;

            this.nextFolder = this.curFolderID;
            this.curFolderID = this.prevFolder;
            
            let parFolder = this.folders.find(item => item.id == this.curFolderID);
            if(parFolder.parent != null)
                this.prevFolder = parFolder.parent;
            else 
                this.prevFolder = false;

            // TODO прикретить регулярки
            let tmpPath = this.visiblePath.split("/");
            tmpPath.pop();
            tmpPath.pop();
            this.visiblePath = tmpPath.join('/') + '/';

            this.selectFolders = [];
            this.selectFiles = [];
        },

        toNextFolder(){
            if(this.nextFolder === false || this.folders[this.nextFolder].isPrivate) return;
            console.log(this.nextFolder);

            this.prevFolder = this.curFolderID;
            this.curFolderID = this.nextFolder;

            let parFolder = this.folders.find(item => item.id == this.curFolderID);
            this.visiblePath += parFolder.name + '/';

            this.nextFolder = false;
            
            this.selectFolders = [];
            this.selectFiles = [];
        },

        visibleModal(typeAddObj){
            this.typeAddObj = typeAddObj;
            
            if(typeAddObj == 'dir')
                this.textAddModal = "Добавить папку";
            else if(typeAddObj == 'file')
                this.textAddModal = "Добавить файл";

            if(!this.isVisibleAddModal){
                this.isVisibleAddModal = true;
            }
        },

        addNewObj(){
            if(!this.nameAddObj){
                this.$refs.modal__error.innerHTML = `<span class='fatal__error'><b>Ошибка!</b> Вы не ввели названиe!</span>`
                this.$refs.objName.classList.add('field_error');
                return;
            }
            
            let today = new Date(),
                dd = String(today.getDate()).padStart(2, '0'),
                mm = String(today.getMonth() + 1).padStart(2, '0'),
                yyyy = today.getFullYear();
            
            if(this.typeAddObj == 'dir'){
                this.folders.push({
                    parent: this.curFolderID,
                    id: this.counterFolders,
                    name: this.nameAddObj,
                    isPrivate: this.privateStatusAddObj,
                    dateCreate: yyyy + '-' + mm + '-' + dd
                })
                this.counterFolders++;

                this.files.push([]);
            } else {
                this.files[this.curFolderID].push({
                    name: this.nameAddObj,
                    isPrivate: this.privateStatusAddObj,
                    dateCreate: yyyy + '-' + mm + '-' + dd
                })
            }

            this.isVisibleAddModal = false;
            this.$refs.modal__error.innerHTML = '';
            this.$refs.objName.classList.remove('field_error');
            this.nameAddObj = ''
        },

        selectObj(e, obj, additem = false){
            let target = e.target;

            if(target.checked)
                obj.push(additem);
            else 
                obj.find((item, ind) =>{
                    if(item == additem)
                    obj.splice(ind, 1);
                })
        },
        
        deleteAll(obj, level = 1){
            if(level == 1)
                this.deleteFiles();
            
            if(obj.length === 0) return;

            for(let itemObj of obj){
                let subitems = this.folders.filter(item => item.parent == itemObj.id);
                
                if(subitems.length == 0) {
                    this.folders[itemObj.id] = {};
                    this.files[itemObj.id] = [];
                    continue;
                }
                let newlvl = level + 1;
                this.deleteAll(subitems, newlvl);

                this.folders[itemObj.id] = {};
                this.files[itemObj.id] = [];
                
            }
            if(level > 1) return;

            this.selectFolders = [];

            // TODO здесь был реиндекс массива
        }, 

        deleteFiles(){ // TODO оптимизировать удаление файла из массива
            for(let num of this.selectFiles)
                this.files[this.curFolderID][num] = null;
            

            let newFiles = [];
            for(let file of this.files[this.curFolderID]){
                if(file !== null)
                    newFiles.push(file)
            }

            this.files[this.curFolderID] = newFiles;
            this.selectFiles = [];
        },

        reindexData(){
            let newFolder = [],
                newElementID = 0,
                newFiles = [];
            
            this.folders.forEach(element => {
                if(Object.keys(element).length !== 0){

                    newFiles.push(this.files[element.id]);

                    let subitems = this.folders.filter(item => item.parent == element.id);

                    for(let key in subitems){
                        let item = subitems[key];

                        this.folders[item.id].parent = newElementID;
                    }

                    element.id = newElementID;
                    newFolder.push(element);
                    ++newElementID;
                }
                    
            });
            this.folders = newFolder;
            this.files = newFiles;

            this.counterFolders = this.folders.length;
        }, 

        cutData(method){
            // buffer
            if(this.selectFolders.length === 0 
                && this.selectFiles.length == 0) return;

            this.cutOutData.folders = [];
            this.cutOutData.method = method;

            for(let item of this.selectFolders){
                this.cutOutData.folders.push(item);
                if(method == 'cut') 
                    item.isCut = true;
                this.copyData(item, 1);
            }
            

            this.cutOutData.files = [];
            for(let item of this.selectFiles){
                let newFile = {};
                Object.assign(newFile, this.files[this.curFolderID][item]);

                newFile.index = item;
                newFile.name += ' - ' + method;
                this.cutOutData.files.push(newFile);

                if(method == 'cut') 
                    this.files[this.curFolderID][item].isCut = true;
            }
            
            this.cutOutData.parent = this.curFolderID;
            
            this.selectFolders = [];
        },
        
        putData(){
            for(let item of this.cutOutData.folders)
                this.putFolder(item);

            for(let item of this.cutOutData.files){
                this.files[this.curFolderID].push(item);
                item.isCut = false;
                if(this.cutOutData.method == "cut")
                    this.files[this.cutOutData.parent].splice(item.index, 1);
            }
            
            this.putFolders = {
                files: [],
                folders: []
            }

            if(this.cutOutData.method == "cut")
                this.deleteAll(this.cutOutData.folders, 1);

            this.cutOutData = {};
            this.selectFiles = [];
        },

        putFolder(folder){
            let copyFolder = {};
            Object.assign(copyFolder, folder);
            this.files.push(this.files[folder.id]);

            copyFolder.parent = this.curFolderID;
            copyFolder.name += ' - ' + this.cutOutData.method;
            copyFolder.id = this.counterFolders;
            copyFolder.isCut = false;
            this.folders.push(copyFolder);

            let shiftRatio = copyFolder.id - folder.id;

            ++this.counterFolders;

            if(this.putFolders.folders.length == 0) return;

            this.putFolders.folders.forEach((item, index) => {
                this.files.push(this.putFolders.files[index]);

                let copyFolder = {};
                Object.assign(copyFolder, item);
                
                copyFolder.parent += shiftRatio;
                copyFolder.id = this.counterFolders;
                copyFolder.isCut = false;

                this.folders.push(copyFolder);
                ++this.counterFolders;
            })

        },

        copyData(folder, level = 1){            
            this.folders.forEach(element => {
                if(element.parent == folder.id){
                    this.putFolders.files.push(this.files[element.id]);
                    this.putFolders.folders.push(element);
                    
                    let newlvl = level + 1;
                    this.copyData(element, newlvl)
                }
            })
        },
    },
    computed: {
        updateCurDisk: function() {
            if(!this.folders) return;

            if(this.curFolderID == 0) // TODO сделано чтобы не перескакивало при перенове файлов
                this.reindexData();
            
            localStorage.setItem('folders', JSON.stringify(this.folders));
            localStorage.setItem('files', JSON.stringify(this.files));

            return this.curDisk = this.folders.filter(item => item.parent == this.curFolderID);
        }
    }
})

app.mount('#app');